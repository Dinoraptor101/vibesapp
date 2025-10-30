import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import './CreatePost.css';
import { faCrop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ImageEditorProps } from '../../../types';
import { logDebug } from '../../../utils/utils';
import Notification from '../../Notification/Notification';

const MIN_IMAGE_DIMENSION = 300;

/**
 * @component ImageEditor
 * @description Provides image cropping functionality using react-cropper. Handles image
 * loading states and cropping operations. Includes a crop button and maintains aspect ratio
 * constraints.
 */
const ImageEditor: React.FC<ImageEditorProps> = React.memo(
  ({ image, onCrop, setIsImageLoaded }) => {
    const cropperRef = useRef<HTMLImageElement & { cropper?: Cropper }>(null);
    const [showNotification, setShowNotification] = useState(false);

    const validateImageDimensions = useCallback((img: HTMLImageElement): boolean => {
      return img.width >= MIN_IMAGE_DIMENSION && img.height >= MIN_IMAGE_DIMENSION;
    }, []);

    useEffect(() => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const isValidSize = validateImageDimensions(img);
        setIsImageLoaded(isValidSize);

        if (!isValidSize) {
          setShowNotification(true);
          onCrop({ type: 'invalid_size' });
        }
      };
    }, [image, setIsImageLoaded, onCrop, validateImageDimensions]);

    const handleCrop = useCallback(() => {
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({
          imageSmoothingQuality: 'high',
          imageSmoothingEnabled: true,
        });

        if (croppedCanvas) {
          croppedCanvas.toBlob(
            (blob) => {
              if (blob) {
                onCrop({ type: 'success', data: blob });
                logDebug('Image cropped successfully');
              }
            },
            'image/webp',
            0.9
          );
        }
      }
    }, [onCrop]);

    return (
      <div className="image-editor">
        {showNotification && (
          <Notification
            message="Image too small (min 300×300)"
            type="error"
            onClose={() => setShowNotification(false)}
          />
        )}
        <Cropper
          src={image}
          style={{ height: 400, width: '100%' }}
          initialAspectRatio={1}
          aspectRatio={1}
          viewMode={1}
          guides={true}
          background={false}
          autoCropArea={1}
          dragMode="move"
          cropBoxResizable={true}
          cropBoxMovable={true}
          minCropBoxWidth={300}
          minCropBoxHeight={300}
          responsive={true}
          checkOrientation={true}
          ref={cropperRef}
          crop={() => setIsImageLoaded(true)}
        />
        <div className="crop-help">Pinch to zoom • Drag corners to resize</div>
        <button
          type="button"
          onClick={handleCrop}
          className="crop-image-button"
          data-testid="crop-button"
        >
          <FontAwesomeIcon icon={faCrop} />
          &nbsp;Crop
        </button>
      </div>
    );
  }
);

ImageEditor.displayName = 'ImageEditor';

export default ImageEditor;
