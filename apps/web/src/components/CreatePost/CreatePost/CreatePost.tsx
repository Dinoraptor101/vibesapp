import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../FloatingEditor/quill.snow.css'; // Correct path
import '../FloatingEditor/quill.theme.css'; // Correct path
import useLocation from '../../../hooks/useLocation';
import useReplyToPost from '../../../hooks/useReplyToPost';
import LocationRequest from '../../LocationRequest/LocationRequest';
import ImageEditor from './ImageEditor';
import ReplyToPost from './ReplyToPost'; // Correct path
import './CreatePost.css'; // Correct path
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import uploadimage from '../../../assets/uploadimage.jpg';
import type { CreatePostProps } from '../../../types';
import Spinner from '../../Spinner/Spinner';
import FloatingEditor from '../FloatingEditor/FloatingEditor';
import CreatePostHandler from './CreatePostHandler'; // Correct path

/**
 * @component CreatePost
 * @description Main component for creating a new post. Provides UI for image upload,
 * cropping, text input, and post submission. Integrates with location services and
 * handles replies to existing posts.
 */
const CreatePost: React.FC<CreatePostProps> = ({ userId, setNotification }) => {
  const [editorState, setEditorState] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const replyToPost = useReplyToPost(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { location, error: locationError, isDenied } = useLocation();

  const postHandler = useMemo(
    () =>
      new CreatePostHandler(
        userId,
        setNotification,
        setLoading,
        setEditorState,
        setImage,
        setCroppedImage,
        navigate
      ),
    [userId, setNotification, navigate]
  );

  const handlePlaceholderClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) =>
      postHandler.handleSubmit(
        event,
        editorState,
        croppedImage,
        canvasRef,
        location,
        locationError
      ),
    [postHandler, editorState, croppedImage, location, locationError]
  );

  if (isDenied) {
    return <LocationRequest />;
  }

  return (
    <div className="create-post-wrapper">
      {replyToPost && !(image && !croppedImage) && <ReplyToPost replyToPost={replyToPost} />}
      <div className="create-post-container">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={postHandler.handleImageChange}
        />
        {!image && !croppedImage && (
          <div className="image-preview" onClick={handlePlaceholderClick}>
            <img src={uploadimage} alt="Upload Placeholder" />
          </div>
        )}
        {image && !croppedImage && (
          <div className="image-editor-wrapper">
            {!isImageLoaded && (
              <div className="spinner">
                <Spinner />
              </div>
            )}
            <ImageEditor
              image={image}
              onCrop={postHandler.handleCrop}
              setIsImageLoaded={setIsImageLoaded} // Pass setIsImageLoaded to ImageEditor
            />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {croppedImage && (
            <div className="image-preview" onClick={handlePlaceholderClick}>
              <img src={URL.createObjectURL(croppedImage)} alt="Cropped Preview" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}
          {croppedImage && (
            <button type="submit" disabled={loading} className="post-button">
              {loading ? (
                <FontAwesomeIcon icon={faPaperPlane} spin />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} />
              )}
              &nbsp;&nbsp;Dispatch
            </button>
          )}
          <div className="editor-wrapper">
            <FloatingEditor
              editorState={editorState}
              handleEditorStateChange={postHandler.handleEditorStateChange}
              loading={loading}
              croppedImage={croppedImage}
              isDisabled={!croppedImage}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(CreatePost);
