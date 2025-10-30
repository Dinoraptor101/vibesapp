import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dmService from '../../../services/dmService';
import type { IConversation } from '../../../types';
import { getCookie } from '../../../utils/cookieUtils';
import './ConversationList.css';
import {
  faArchive,
  faCheck,
  faClock,
  faCommentDots,
  faLock,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getPermissionDirectMessage } from '../../../services/userPermissions';
import Spinner from '../../Spinner/Spinner';

const ConversationList: React.FC<{ userId: string }> = ({ userId }) => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDMPermission, setHasDMPermission] = useState(false);
  const currentUserId = getCookie('userId');
  const navigate = useNavigate();

  const sortConversations = useCallback((conversations: IConversation[]) => {
    return conversations.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.hasUnreadMessages && !b.hasUnreadMessages) return -1;
      if (!a.hasUnreadMessages && b.hasUnreadMessages) return 1;
      if (a.status === 'approved' && b.status !== 'approved') return -1;
      if (a.status !== 'approved' && b.status === 'approved') return 1;
      if (a.status === 'closed' && b.status !== 'closed') return 1;
      if (a.status !== 'closed' && b.status === 'closed') return -1;
      return 0;
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoading(true); // Ensure loading state is set before fetching
    try {
      const response = await dmService.getConversations(userId);
      const sortedConversations = sortConversations(response.data);
      setConversations(sortedConversations);
    } catch (_error) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false); // Ensure loading state is updated after fetching
    }
  }, [userId, sortConversations]);

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await getPermissionDirectMessage();
      setHasDMPermission(permission);
    };
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasDMPermission) {
      fetchConversations();
      // Poll for conversation updates
      const interval = setInterval(fetchConversations, 60000); // once a minute
      return () => clearInterval(interval);
    }
  }, [fetchConversations, hasDMPermission]);

  const handleApprove = async (e: React.MouseEvent, conversation: IConversation) => {
    e.stopPropagation();
    try {
      await dmService.approveDMRequest(currentUserId, conversation.user1Id, conversation.user2Id);
      fetchConversations();
    } catch (_error) {
      setError('Failed to approve DM request');
    }
  };

  const handleDecline = async (e: React.MouseEvent, conversation: IConversation) => {
    e.stopPropagation();
    try {
      await dmService.declineDMRequest(currentUserId, conversation.user1Id, conversation.user2Id);
      fetchConversations();
    } catch (_error) {
      setError('Failed to decline DM request');
    }
  };

  const handleSeeProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/user/${userId}`);
  };

  const getOtherUsername = (conversation: IConversation): string => {
    return currentUserId === conversation.user1Id
      ? conversation.user2Username
      : conversation.user1Username;
  };

  const getLastMessage = (conversation: IConversation) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage.body;
    }
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[conversation.messages.length - 1].body;
    }
    return 'No messages yet';
  };

  const openConversation = (conversation: IConversation) => {
    if (conversation.status === 'approved' || conversation.status === 'closed') {
      navigate(`/conversations/${conversation.conversationId}`);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="conversation-error">{error}</div>;
  if (!hasDMPermission)
    return (
      <div className="no-permission">
        <FontAwesomeIcon icon={faLock} />
        <strong>Messenger</strong>&nbsp;is not available to you.
      </div>
    );
  if (conversations.length === 0)
    return (
      <div className="no-conversations">
        <FontAwesomeIcon icon={faCommentDots} className="no-conversations-icon" />
        <div className="no-conversations-title">No conversations</div>
        <div className="no-conversations-instructions">
          To start a conversation, go to a user's profile and click "Request Chat"
        </div>
      </div>
    );

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const isPendingSent =
          conversation.status === 'pending' && conversation.lastRequesterId === currentUserId;
        const isPendingReceived =
          conversation.status === 'pending' &&
          (conversation.user1Id === currentUserId || conversation.user2Id === currentUserId) &&
          conversation.lastRequesterId !== currentUserId;
        const isApproved = conversation.status === 'approved';
        const isClosed = conversation.status === 'closed';
        const otherUsername = getOtherUsername(conversation);

        return (
          <div
            key={conversation.conversationId}
            className={`conversation-item ${isPendingSent ? 'pending-outgoing' : ''} 
                      ${isPendingReceived ? 'pending-incoming' : ''} 
                      ${isApproved ? 'approved' : ''} 
                      ${isClosed ? 'closed' : ''}`}
            onClick={() => openConversation(conversation)}
          >
            {isPendingSent && (
              <div className="conversation-header">
                <div className="conversation-username">{otherUsername}</div>
                <div className="pending-icon">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Awaiting Response</span>
                </div>
              </div>
            )}
            {isPendingReceived && (
              <>
                <div className="conversation-header">
                  <div className="conversation-username">{otherUsername}</div>
                  <div className="request-label">Message Request</div>
                </div>
                <div className="dm-request-actions">
                  <button
                    type="button"
                    className="profile-button"
                    onClick={(e) => handleSeeProfile(e, conversation.lastRequesterId)}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>See Profile</span>
                  </button>
                  <button
                    type="button"
                    className="accept-button"
                    onClick={(e) => handleApprove(e, conversation)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Accept</span>
                  </button>
                  <button
                    type="button"
                    className="decline-button"
                    onClick={(e) => handleDecline(e, conversation)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Decline</span>
                  </button>
                </div>
              </>
            )}
            {isApproved && (
              <>
                <div className="conversation-header">
                  <div className="conversation-username">{otherUsername}</div>
                  {conversation.hasUnreadMessages && <span className="unread-dot"></span>}
                </div>
                <div className={`last-message ${conversation.hasUnreadMessages ? 'unread' : ''}`}>
                  {getLastMessage(conversation)}
                </div>
              </>
            )}
            {isClosed && (
              <div className="conversation-header">
                <div className="conversation-username">{otherUsername}</div>
                <div className="archived-icon">
                  <FontAwesomeIcon icon={faArchive} />
                  <span>Archived</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
