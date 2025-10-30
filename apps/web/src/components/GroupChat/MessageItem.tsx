import { faBell, faBellSlash, faMinus, faPlus, faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from 'dompurify';
import moment from 'moment';
import type React from 'react';
import { Link } from 'react-router-dom';
import type { IMessageItem } from '../../types';

// Function to convert URLs in text to hyperlinks
function linkify(text: string) {
  const urlPattern = /(\b(https|http):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(
    urlPattern,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
}

// Function to truncate long words and add ellipsis
function truncateText(text: string, maxLength: number) {
  return text
    .split(' ')
    .map((word) => {
      if (word.length > maxLength) {
        return `${word.substring(0, maxLength)}...`;
      }
      return word;
    })
    .join(' ');
}

const MAX_WORD_LENGTH = 35; // Define max word length constant

/**
 * @component MessageItem
 * @description Renders an individual message in the chat thread with rich functionality.
 * Supports URL parsing, reply actions, message watching, and thread collapsing.
 * Displays message metadata like timestamps and user information.
 *
 * @param {IMessageItem} props - Component properties
 * @param {IMessage} props.message - Message data to display
 * @param {number} props.depth - Nesting level of the message in thread
 * @param {boolean} props.isExpanded - Whether the chat window is expanded
 * @param {boolean} props.hasReplies - Whether the message has replies
 * @param {boolean} props.isWatched - Whether the message is being watched
 * @param {number} props.replyCount - Number of replies to this message
 * @param {function} props.toggleCollapse - Function to toggle thread collapse
 * @param {function} props.handleReply - Function to handle replies
 * @param {function} props.toggleWatchMessage - Function to toggle message watching
 * @param {Object} props.collapsedMessages - Object tracking collapsed threads
 */
const MessageItem: React.FC<IMessageItem> = ({
  message,
  depth,
  isExpanded,
  hasReplies,
  isWatched,
  replyCount,
  toggleCollapse,
  handleReply,
  toggleWatchMessage,
  collapsedMessages,
  renderMessages,
  messages,
}) => {
  const parsedBody = linkify(message.body);
  const truncatedBody = truncateText(parsedBody, MAX_WORD_LENGTH);
  const sanitizedBody = DOMPurify.sanitize(truncatedBody);

  return (
    <li key={message._id} className={`message-item ${depth > 0 ? 'reply-item' : ''}`}>
      <div className="message-row" style={{ marginLeft: depth * 5 }}>
        {isExpanded && hasReplies && (
          <button
            type="button"
            className="collapse-button"
            onClick={() => toggleCollapse?.(message._id)}
          >
            <FontAwesomeIcon icon={collapsedMessages?.[message._id] ? faPlus : faMinus} />
            {collapsedMessages?.[message._id] && (
              <>
                <br />
                {replyCount}
              </>
            )}
          </button>
        )}
        <div className="message-content-container">
          <div className="message-content" title={message.body}>
            <strong>
              <Link to={`/user/${message.userId}`} className="user-profile-link">
                {message.userName}
              </Link>
              :
            </strong>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify */}
            <span dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="message-actions-container">
          <div className="message-actions">
            <button
              type="button"
              className="message-action-button"
              onClick={() => handleReply?.(message._id, message.userName)}
            >
              <FontAwesomeIcon icon={faReply} />
            </button>
            <button
              type="button"
              className="message-action-button"
              onClick={async () => toggleWatchMessage?.(message._id)}
              title={isWatched ? 'Unsubscribe' : 'Subscribe'}
            >
              <FontAwesomeIcon icon={isWatched ? faBellSlash : faBell} />
            </button>
          </div>
          <div className="message-timestamp">{moment(message.timestamp).fromNow()}</div>
        </div>
      )}
      {!collapsedMessages?.[message._id] && hasReplies && messages && (
        <ul className="replies-list">{renderMessages?.(messages, message._id, depth + 1)}</ul>
      )}
    </li>
  );
};

export default MessageItem;
