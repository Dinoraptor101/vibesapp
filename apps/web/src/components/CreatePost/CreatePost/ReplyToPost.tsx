import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import type React from 'react';
import { Link } from 'react-router-dom';
import type { IReplyToPost } from '../../../types';
import { getImageUrl } from '../../../utils/utils';

const isContentEmpty = (text: string) => {
  const sanitizedText = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return !sanitizedText.trim() || sanitizedText === '<p></p>\n';
};

/**
 * @component ReplyToPost
 * @description Displays a miniature version of the post being replied to, including
 * its image and text content. Provides a link to the original post and handles text
 * sanitization.
 */
const ReplyToPost: React.FC<IReplyToPost> = ({ replyToPost }) => {
  return (
    <div className="reply-to-post">
      <h5>Replying to:</h5>
      <div className="mini-post">
        <Link to={`/post/${replyToPost._id}`} className="replyto-post-link">
          <div className="mini-post-image">
            <img
              src={getImageUrl(replyToPost.image, 'low')}
              alt={replyToPost.text || 'Reply post image'}
            />
            {!isContentEmpty(replyToPost.text) && (
              <div className="mini-post-content">
                <div className="parsed-content">
                  {parse(
                    DOMPurify.sanitize(replyToPost.text, {
                      ALLOWED_TAGS: [],
                      ALLOWED_ATTR: [],
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ReplyToPost;
