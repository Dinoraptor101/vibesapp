import ReactQuill from 'react-quill-new';
import '../FloatingEditor/quill.snow.css'; // Correct path
import '../FloatingEditor/quill.theme.css'; // Correct path
import './FloatingEditor.css'; // Correct path
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FloatingEditorProps } from '../../../types';
import SmoothScroll from '../../animation/SmoothScroll';

/**
 * @component FloatingEditor
 * @description A rich text editor component that expands when focused and collapses when
 * clicking outside. Features smooth scrolling and animation effects. Integrates with
 * ReactQuill for text formatting capabilities.
 */
const FloatingEditor: React.FC<FloatingEditorProps> = ({
  editorState,
  handleEditorStateChange,
  loading,
  croppedImage,
  isDisabled,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDisabledMessage, setShowDisabledMessage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill | null>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Type assertion to treat event.target as a Node to use the contains method
    if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
      setIsExpanded(false);
    }
  }, []);

  const handleEditorClick = () => {
    if (!isDisabled) {
      if (!isExpanded) {
        setIsExpanded(true);
      } else if (quillRef.current) {
        quillRef.current.focus();
      }
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      if (quillRef.current) {
        quillRef.current.blur();
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleClickOutside]);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (isExpanded) {
        SmoothScroll.scroll(editor.root, editor.root.scrollHeight, 500); // Scroll to bottom over 500ms
      } else {
        SmoothScroll.scroll(editor.root, 0, 500); // Scroll to top over 500ms
      }
    }
  }, [isExpanded]);

  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (quillRef.current) {
  //       quillRef.current.focus();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);

  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, []);

  return (
    <>
      {isExpanded && <div className="overlay" onClick={() => setIsExpanded(false)}></div>}
      <div
        className="editor-container"
        onMouseEnter={() => isDisabled && setShowDisabledMessage(true)}
        onMouseLeave={() => setShowDisabledMessage(false)}
        onClick={() => isDisabled && setShowDisabledMessage(true)}
      >
        {isDisabled && showDisabledMessage && (
          <div className="editor-disabled-message">Upload an image first</div>
        )}
        <div
          className={`floating-editor ${isExpanded ? 'expanded' : 'collapsed'} ${isDisabled ? 'editor-disabled' : ''}`}
          ref={editorRef}
          onClick={handleEditorClick}
          data-testid="floating-editor"
        >
          {!isExpanded && (
            <div
              className="invisible-overlay"
              onClick={() => !isDisabled && setIsExpanded(true)}
            ></div>
          )}{' '}
          {croppedImage && isExpanded && (
            <button
              type="submit"
              disabled={loading}
              className="dispatch-button"
              data-testid="editor-dispatch-button"
            >
              {loading ? (
                <FontAwesomeIcon icon={faPaperPlane} spin />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} />
              )}
            </button>
          )}
          <ReactQuill
            ref={quillRef}
            value={editorState}
            onChange={handleEditorStateChange}
            placeholder="The first 100 letters show on post."
            modules={{
              toolbar: [
                [{ header: '1' }, { header: '2' }, { font: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ align: [] }],
              ],
            }}
            readOnly={isDisabled}
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }} // Disable pointer events when collapsed
          />
        </div>
      </div>
    </>
  );
};

export default FloatingEditor;
