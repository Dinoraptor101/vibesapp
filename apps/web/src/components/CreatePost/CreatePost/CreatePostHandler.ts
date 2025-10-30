import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { debounce } from 'lodash';
import posthog from 'posthog-js';
import type React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import apiService from '../../../services/apiService';
import type { CropResponse, INotification } from '../../../types';
import { getPresignedUrl, logDebug, timeDebug } from '../../../utils/utils';

// eslint-disable-next-line no-unused-vars
type SetNotification = (notification: INotification) => void;
// eslint-disable-next-line no-unused-vars
type SetLoading = (loading: boolean) => void;
// eslint-disable-next-line no-unused-vars
type SetEditorState = (state: string) => void;
// eslint-disable-next-line no-unused-vars
type SetImage = (image: string | null) => void;
// eslint-disable-next-line no-unused-vars
type SetCroppedImage = (image: Blob | null) => void;

/**
 * @class CreatePostHandler
 * @description Handles all the logic for creating a new post, including image processing,
 * compression, uploading, and API communication. It manages the state updates and notifications
 * during the post creation process.
 */
class CreatePostHandler {
  userId: string;
  setNotification: SetNotification;
  setLoading: SetLoading;
  setEditorState: SetEditorState;
  setImage: SetImage;
  setCroppedImage: SetCroppedImage;
  private navigate: NavigateFunction;

  private readonly compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.9,
  };

  constructor(
    userId: string,
    setNotification: SetNotification,
    setLoading: SetLoading,
    setEditorState: SetEditorState,
    setImage: SetImage,
    setCroppedImage: SetCroppedImage,
    navigate: NavigateFunction
  ) {
    this.userId = userId;
    this.setNotification = setNotification;
    this.setLoading = setLoading;
    this.setEditorState = setEditorState;
    this.setImage = setImage;
    this.setCroppedImage = setCroppedImage;
    this.navigate = navigate;
    this.handleEditorStateChange = debounce(this.handleEditorStateChange, 150);
  }

  private async compressImage(blob: Blob): Promise<Blob> {
    const file = new File([blob], 'image.webp', { type: blob.type });
    return imageCompression(file, this.compressionOptions);
  }

  private async uploadImage(url: string, image: Blob): Promise<void> {
    await axios.put(url, image, {
      headers: { 'Content-Type': image.type },
    });
  }

  handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      this.setNotification({ message: 'No file selected', type: 'error' });
      return;
    }
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    this.setImage(imageUrl);
    this.setCroppedImage(null); // Reset cropped image when a new image is selected
    logDebug('Image selected for cropping');
  };

  handleCrop = (response: CropResponse) => {
    switch (response.type) {
      case 'success':
        if (response.data) {
          this.setCroppedImage(response.data);
        }
        break;
      case 'invalid_size':
        this.setImage(null);
        this.setNotification({
          message: 'Image too small (min 300×300)',
          type: 'error',
        });
        break;
    }
  };

  handleEditorStateChange = (value: string) => {
    this.setEditorState(value);
  };

  handleCreatePost = async (
    event: React.FormEvent,
    editorState: string,
    croppedImage: Blob | null,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    location: { lat: number; lon: number } | null
  ) => {
    event.preventDefault();
    this.setLoading(true);
    logDebug('Creating post');
    logDebug(`Location: ${JSON.stringify(location)}`);

    if (!location) {
      throw new Error('Location not available');
    }

    try {
      const { lat, lon } = location;
      if (!lat || !lon) {
        throw new Error('Location not available');
      }

      if (!croppedImage) {
        this.setNotification({
          message: 'Please upload an image, keep it civil.',
          type: 'error',
        });
        this.setLoading(false);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        this.setNotification({
          message: 'Canvas not available',
          type: 'error',
        });
        this.setLoading(false);
        return;
      }
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = URL.createObjectURL(croppedImage);
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (context) {
          context.drawImage(img, 0, 0);
        } else {
          this.setNotification({
            message: 'Failed to edit image',
            type: 'error',
          });
          this.setLoading(false);
          return;
        }

        canvas.toBlob(async (blob) => {
          if (!blob) {
            this.setNotification({
              message: 'Failed to store image into RAM',
              type: 'error',
            });
            this.setLoading(false);
            return;
          }

          try {
            const compressedImage = await this.compressImage(blob);
            const presignedUrlResponse = await apiService.get(getPresignedUrl);

            const { url, key } = presignedUrlResponse.data;
            logDebug('Presigned URL:', url);
            logDebug('Key:', key);

            await Promise.all([
              this.uploadImage(url, compressedImage),
              // Other parallel operations if any
            ]);

            const replyToId = new URLSearchParams(window.location.search).get('replyTo');
            logDebug(`Replying to post with ID: ${replyToId}`);

            const postData = {
              text: editorState,
              image: key,
              userId: this.userId,
              lat: lat,
              lon: lon,
              replyTo: replyToId,
            };

            timeDebug('Post Creation API Call', async () => {
              try {
                await apiService.post('/api/posts/create', postData);
              } catch (error) {
                console.error(error);
                const errorMessage = 'Could not reach the base, reported to the fox.';
                this.setNotification({ message: errorMessage, type: 'error' });
                this.setLoading(false);
                console.error('Post creation failed', 'Post Creation API Call');
                console.error(error);
                posthog.capture('Post Creation Failed', {
                  userId: this.userId,
                  error: error instanceof Error ? error.message : 'Unknown error',
                });
                return;
              }
              logDebug('Post created via API successfully', 'Post Creation API Call');
            });

            posthog.capture('Post Created', {
              userId: this.userId,
              postId: key,
            });

            this.setEditorState('');
            this.setImage(null);
            this.setCroppedImage(null);
            this.setNotification({
              message: 'Posted',
              type: 'success',
            });

            // return to OG postif replying, else go home
            if (replyToId) {
              this.navigate(-1);
            } else {
              this.navigate('/');
            }
            logDebug('Post created successfully');
          } catch (error) {
            console.error(error);
            const errorMessage = 'Your pigeon is sick, reported to the fox.';
            this.setNotification({ message: errorMessage, type: 'error' });
            this.setLoading(false);
            console.error('Post creation failed', 'Post Creation API Call');
            console.error(error);
            posthog.capture('Post Creation Failed', {
              userId: this.userId,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } finally {
            this.setLoading(false);
          }
        });
      };
    } catch (error) {
      this.setNotification({
        message: 'Unknown Error, see console log.',
        type: 'error',
      });
      console.error(error);
      this.setLoading(false);
    }
  };

  handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    editorState: string,
    croppedImage: Blob | null,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    location: { lat: number; lon: number } | null,
    error: string | null
  ): void => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (error) {
      this.setNotification({ message: error, type: 'error' });
      posthog.capture('Post Creation Failed', {
        userId: this.userId,
        error,
      });
      return;
    }

    this.handleCreatePost(event, editorState, croppedImage, canvasRef, location);
  };
}

export default CreatePostHandler;
