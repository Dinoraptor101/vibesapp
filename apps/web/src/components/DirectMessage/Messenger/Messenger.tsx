import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useErrorReporting } from '../../../hooks/useErrorReporting';
import dmService from '../../../services/dmService';
import './Messenger.css';
import {
  faArchive,
  faArrowLeft,
  faArrowUpFromBracket,
  faClock,
  faLock,
  faPaperPlane,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getPermissionDirectMessage } from '../../../services/userPermissions';
import type { IDirectMessage } from '../../../types';
import type { MessengerProps } from '../../../types/props';
import { getCookie } from '../../../utils/cookieUtils';
import { isAndroidDevice, isIosDevice, isStandaloneMode } from '../../../utils/deviceUtils';

const MAX_MESSAGE_LENGTH = 120;

const Messenger: React.FC<MessengerProps> = ({ conversationId, isDMRequest = false }) => {
  const [messages, setMessages] = useState<IDirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [user1Username, setUser1Username] = useState<string>('');
  const [user2Username, setUser2Username] = useState<string>('');
  const [user1Id, setUser1Id] = useState<string>('');
  const [user2Id, setUser2Id] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = getCookie('userId');
  const navigate = useNavigate();
  const [conversationStatus, setConversationStatus] = useState<string>('approved');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasDMPermission, setHasDMPermission] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const lastMessageCountRef = useRef<number>(0);
  const { reportApiError } = useErrorReporting({
    featureName: 'directMessage',
    userId: currentUserId || '',
  });

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await getPermissionDirectMessage();
      setHasDMPermission(permission);
    };
    checkPermission();
    setIsInStandaloneMode(isStandaloneMode());
  }, []);

  // Determine which username to display in the header (the other user's name)
  const otherUserName = currentUserId === user1Id ? user2Username : user1Username;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchMessages = useCallback(async () => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await dmService.getConversation(conversationId);
      console.log('Fetched messages:', response.data);

      // Only update state if there are new messages or it's the first load
      const newMessages = response.data.messages;
      if (newMessages.length > lastMessageCountRef.current) {
        console.log('New messages detected, updating state');
        setMessages(newMessages);
        // Update the message count ref after state update
        lastMessageCountRef.current = newMessages.length;

        // Mark messages as read when new messages are detected
        await dmService.markMessagesAsRead(conversationId, currentUserId);
      }

      // Always update user info and status - these rarely change and don't cause visual refreshes
      if (!user1Username || !user2Username) {
        setUser1Username(response.data.user1Username);
        setUser2Username(response.data.user2Username);
        setUser1Id(response.data.user1Id);
        setUser2Id(response.data.user2Id);
      }

      // Update conversation status if changed
      if (response.data.status && response.data.status !== conversationStatus) {
        setConversationStatus(response.data.status);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
      reportApiError('fetchMessages', error, {
        conversationId,
        context: 'DirectMessage polling',
      });
    }
  }, [conversationId, currentUserId, user1Username, user2Username, conversationStatus]);

  useEffect(() => {
    if (hasDMPermission && conversationStatus !== 'closed') {
      // Initial fetch of messages
      fetchMessages();

      // Set up polling interval
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, hasDMPermission, conversationStatus]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newMessage.trim() === '' || countdown > 0 || newMessage.length > MAX_MESSAGE_LENGTH) return;

    // Start the countdown to prevent spamming
    setCountdown(5);

    try {
      // Determine the recipient of the message
      const recipientId = currentUserId === user1Id ? user2Id : user1Id;
      await dmService.sendMessage(currentUserId, recipientId, newMessage);
      setNewMessage('');
      // After sending a message, fetch messages immediately to show the sent message
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message', error);
      reportApiError('sendMessage', error, {
        recipientId: currentUserId === user1Id ? user2Id : user1Id,
        messageLength: newMessage.length,
        context: 'DirectMessage send',
      });
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const formatTimestamp = (timestamp: string) => {
    return moment(timestamp).fromNow(); // This will return strings like "2 minutes ago"
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCloseClick = () => {
    setShowConfirmDialog(true);
  };

  const handleCloseConfirm = async () => {
    try {
      await dmService.closeConversation(conversationId);
      setConversationStatus('closed');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to close conversation', error);
      reportApiError('closeConversation', error, {
        conversationId,
        context: 'DirectMessage close conversation',
      });
    }
  };

  const handleCloseCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleHeaderClick = () => {
    const otherUserId = currentUserId === user1Id ? user2Id : user1Id;
    navigate(`/user/${otherUserId}`);
  };

  const isArchived = conversationStatus === 'closed';

  if (!hasDMPermission) {
    return (
      <div className="messaging-interface-fullscreen">
        <div className="messaging-overlay" onClick={handleBackClick}></div>
        <div className="messaging-content-wrapper">
          <div className="messaging-header">
            <button
              type="button"
              className="back-button"
              onClick={handleBackClick}
              data-testid="back-button"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2>Messenger</h2>
          </div>
          <div className="no-permission">
            <FontAwesomeIcon icon={faLock} />
            <strong>Messenger</strong>&nbsp;is not available to you.
          </div>
        </div>
      </div>
    );
  }

  if (!isInStandaloneMode && window.innerWidth <= 500 && (isIosDevice() || isAndroidDevice())) {
    return (
      <div className="messaging-interface-fullscreen">
        <div className="messaging-overlay"></div>
        <div className="messaging-content-wrapper">
          <div className="messaging-header">
            <button
              type="button"
              className="back-button"
              onClick={handleBackClick}
              data-testid="back-button"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2>Messenger</h2>
          </div>
          <div className="add-to-home-screen-prompt">
            <div className="prompt-content">
              <p style={{ fontSize: 'larger' }}>
                <strong>Messenger</strong> requires app mode.
              </p>
              <p>
                Tap share <FontAwesomeIcon icon={faArrowUpFromBracket} /> then{' '}
                <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-interface-fullscreen">
      <div className="messaging-overlay" onClick={handleBackClick}></div>

      <button
        type="button"
        className="back-button"
        onClick={handleBackClick}
        data-testid="back-button"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="messaging-content-wrapper">
        <div className="messaging-header">
          <div className="username-container" onClick={handleHeaderClick}>
            <h2 className="clickable-username">{otherUserName}</h2>
          </div>
          {!isArchived && (
            <button type="button" className="close-conversation-button" onClick={handleCloseClick}>
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>End Chat</span>
            </button>
          )}
        </div>

        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <h3>End Chat</h3>
              <p>
                This will archive the conversation. You will not be able to chat with{' '}
                <strong>{otherUserName}</strong> unless a new request is approved.
              </p>
              <div className="confirm-dialog-buttons">
                <button type="button" className="cancel-button" onClick={handleCloseCancel}>
                  Cancel
                </button>
                <button type="button" className="confirm-button" onClick={handleCloseConfirm}>
                  End Chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="messaging-interface-container">
          <div className="messaging-interface">
            <div className="message-list">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`direct-message-item ${isCurrentUser ? 'current-user' : 'other-user'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-content">{message.body}</div>
                      <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {!isDMRequest && !isArchived ? (
              <div className="message-input-form">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value.substring(0, MAX_MESSAGE_LENGTH))}
                    placeholder="Type a kind message"
                    required
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="character-count">
                    {newMessage.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="send-button"
                  disabled={
                    countdown > 0 ||
                    newMessage.trim() === '' ||
                    newMessage.length > MAX_MESSAGE_LENGTH
                  }
                >
                  {countdown > 0 ? (
                    <FontAwesomeIcon icon={faClock} />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} />
                  )}
                </button>
              </div>
            ) : isArchived ? (
              <div className="conversation-ended">
                <FontAwesomeIcon icon={faArchive} />
                <span>This conversation has ended</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messenger;
