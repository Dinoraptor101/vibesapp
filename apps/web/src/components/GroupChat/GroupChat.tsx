import {
  faAngleDoubleDown,
  faBell,
  faBellSlash,
  faClock,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import useGroupChatHandler from '../../hooks/useGroupChatHandler';
import { useNearBottom } from '../../hooks/useNearBottom';
import { useNewMessageIndicator } from '../../hooks/useNewMessageIndicator';
import useVisibility from '../../hooks/useVisibility';
import Notification from '../Notification/Notification';
import Spinner from '../Spinner/Spinner';
import MessageList from './MessageList';
import './GroupChat.css';
import { getPermissionGroupChat } from '../../services/userPermissions';
import type { GroupChatProps, IMessage } from '../../types';

const MAX_MESSAGE_LENGTH = 120;

/**
 * @component GroupChat
 * @description Main chat component that provides a complete messaging interface.
 * Features include:
 * - Threaded conversations with collapsible replies
 * - Message watching/notifications
 * - Real-time updates
 * - Expandable/collapsible chat window
 * - Permission-based messaging
 * - URL parsing in messages
 * - Timestamp displays
 * - New message indicators
 *
 * @param {GroupChatProps} props - Component properties
 * @param {string} props.postId - ID of the post this chat belongs to
 * @param {string} props.userId - ID of the current user
 *
 * @requires useGroupChatHandler
 * @requires useNearBottom
 * @requires useNewMessageIndicator
 * @requires useVisibility
 */
const GroupChat: React.FC<GroupChatProps> = ({ postId, userId }) => {
  const messagesEndRef = useRef(null);
  const inputFieldRef = useRef<HTMLInputElement>(null);
  const conversationBoxRef = useRef(null);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const isVisible = useVisibility();
  const [groupChatAllowed, setGroupChatAllowed] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await getPermissionGroupChat();
      setGroupChatAllowed(hasPermission);
    };

    checkPermissions();
  }, []);

  const {
    groupChatId,
    newMessage,
    tooltip,
    replyMessageId,
    replyUserName,
    collapsedMessages,
    error,
    watchedMessages,
    setNewMessage,
    handleSendMessage,
    showNotification,
    setShowNotification,
    countdown,
    handleReply,
    scrollToBottom,
    toggleCollapse,
    toggleWatchMessage,
    isExpanded,
    setIsExpanded,
    messages,
    handleDismiss,
    isGroupChatWatched,
    toggleWatchGroupChat,
    fetchGroupChatWatchStatus,
  } = useGroupChatHandler(postId, userId, messagesEndRef, isVisible);

  const isNearBottom = useNearBottom(conversationBoxRef);
  useNewMessageIndicator(
    messages,
    isExpanded,
    scrollToBottom,
    setShowNewMessageIndicator,
    isNearBottom
  );

  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      scrollToBottom();
    }
    if (isExpanded && groupChatId) {
      console.log('fetching watch status');
      fetchGroupChatWatchStatus(groupChatId); // Fetch watch status when maximized
    }
  }, [isExpanded, scrollToBottom, groupChatId, fetchGroupChatWatchStatus]);

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isExpanded]);

  if (error) return <div className="error">Error: {error}</div>;
  if (!groupChatId) return <Spinner />;
  const getRecentTopLevelMessages = () => {
    const topLevelMessages = messages.filter((msg: IMessage) => !msg.parentMessageId);
    return topLevelMessages.slice(-3);
  };

  const displayedMessages = isExpanded ? messages : getRecentTopLevelMessages();

  const scrollToInputField = () => {
    inputFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  return (
    <>
      {showNotification && (
        <Notification
          message="Message cannot be blank."
          onClose={() => setShowNotification(null)}
          type="error"
        />
      )}
      {isExpanded && <div className="overlay" onClick={handleDismiss}></div>}
      <div className={`group-chat ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded &&
          isGroupChatWatched !== null && ( // Ensure button is displayed only when status is fetched
            <button
              type="button"
              className="group-chat-watch-toggle"
              onClick={toggleWatchGroupChat}
              title={isGroupChatWatched ? 'Unsubscribe' : 'Subscribe'}
            >
              <FontAwesomeIcon icon={isGroupChatWatched ? faBellSlash : faBell} />
            </button>
          )}
        <div
          className="conversation-box"
          ref={conversationBoxRef}
          onClick={() => setIsExpanded(true)}
        >
          {displayedMessages.length === 0 ? (
            <div>No messages yet. Be the first to send a message!</div>
          ) : (
            <MessageList
              messages={displayedMessages}
              isExpanded={isExpanded}
              toggleCollapse={toggleCollapse}
              handleReply={handleReply}
              toggleWatchMessage={toggleWatchMessage}
              collapsedMessages={collapsedMessages}
              watchedMessages={watchedMessages}
            />
          )}
          <div ref={messagesEndRef} />
          {showNewMessageIndicator && (
            <div
              className={`new-message-indicator ${showNewMessageIndicator ? '' : 'hidden'}`}
              onClick={scrollToBottom}
              data-testid="new-message-indicator"
            >
              <FontAwesomeIcon icon={faAngleDoubleDown} />
              <span className="new-message-text">New Message</span>
            </div>
          )}
        </div>
        {replyMessageId && (
          <button
            type="button"
            className="replying-to"
            onClick={() => handleReply(null, null)}
            data-testid="replying-to-button"
          >
            <FontAwesomeIcon icon={faTimes} className="fa-times-icon" /> Replying to {replyUserName}
          </button>
        )}
        <div className="message-input-container">
          <div className="input-wrapper">
            <input
              ref={inputFieldRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.substring(0, MAX_MESSAGE_LENGTH))}
              placeholder={
                groupChatAllowed ? 'Write a kind message' : 'Chat disabled, Vibe is too low.'
              }
              className="message-input"
              onClick={() => {
                setIsExpanded(true);
                scrollToInputField();
              }}
              onFocus={() => {
                setIsExpanded(true);
                scrollToInputField();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!groupChatAllowed}
              data-testid="group-chat-input"
            />
            <div className="character-count">
              {newMessage.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSendMessage}
            className="send-button"
            disabled={
              countdown > 0 ||
              !groupChatAllowed ||
              newMessage.trim() === '' ||
              newMessage.length > MAX_MESSAGE_LENGTH
            }
            data-testid="group-chat-send-button"
          >
            {countdown > 0 ? (
              <FontAwesomeIcon icon={faClock} />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
          {tooltip.visible && (
            <div className={`tooltip ${tooltip.visible ? 'tooltip-visible' : ''}`}>
              {tooltip.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupChat;
