import { faClock, faCommentDots, faMessage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestButton.css';
import dmService from '../../../services/dmService';
import { getPermissionDirectMessage } from '../../../services/userPermissions';
import type { IConversationStatus, RequestButtonProps } from '../../../types';
import { getCookie } from '../../../utils/cookieUtils';

/**
 * RequestButton component that shows different states depending on conversation status:
 * 1. Not visible if viewing own profile
 * 2. "Open Chat" if an approved conversation exists
 * 3. "Request Chat" if no conversation exists
 */
const RequestButton: React.FC<RequestButtonProps> = ({ profileUserId, setNotification }) => {
  const currentUserId = getCookie('userId');
  const [loading, setLoading] = useState(true);
  const [conversationStatus, setConversationStatus] = useState<IConversationStatus>({
    exists: false,
  });
  const [hasDMPermission, setHasDMPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await getPermissionDirectMessage();
      setHasDMPermission(permission);
    };
    checkPermission();
  }, []);

  useEffect(() => {
    const checkConversationStatus = async () => {
      if (currentUserId && profileUserId) {
        setLoading(true);
        try {
          const status: IConversationStatus = await dmService.getStatus(
            currentUserId,
            profileUserId
          );
          setConversationStatus(status);
        } catch (error) {
          console.error('Failed to fetch conversation status:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkConversationStatus();
  }, [currentUserId, profileUserId]);

  // Don't show anything if loading, viewing own profile, or no DM permission
  if (loading || currentUserId === profileUserId || !hasDMPermission) {
    return null;
  }

  const handleClick = async () => {
    // Case 1: Existing approved conversation - open it
    if (
      conversationStatus.exists &&
      conversationStatus.status === 'approved' &&
      conversationStatus.conversationId
    ) {
      navigate(`/conversations/${conversationStatus.conversationId}`);
      return;
    }

    // Case 2: Pending conversation initiated by current user - show notification
    if (
      conversationStatus.exists &&
      conversationStatus.status === 'pending' &&
      conversationStatus.lastRequesterId === currentUserId
    ) {
      if (setNotification) {
        setNotification({
          message: 'Chat request already sent and pending',
          type: 'info',
        });
      }
      return;
    }

    // Case 3: Pending conversation initiated by the other user - navigate to conversations page
    if (
      conversationStatus.exists &&
      conversationStatus.status === 'pending' &&
      conversationStatus.lastRequesterId !== currentUserId
    ) {
      // Navigate to conversations page instead of specific conversation
      navigate('/conversations');
      return;
    }

    // Case 4: Closed conversation - reopen it by sending a new request
    if (conversationStatus.exists && conversationStatus.status === 'closed') {
      try {
        if (!currentUserId || !profileUserId) return;
        await dmService.sendDMRequest(currentUserId, profileUserId);
        // if (setNotification) {
        //   setNotification({
        //     message: 'Request sent!',
        //     type: 'success',
        //   });
        // }
        // Refresh the button status
        const status: IConversationStatus = await dmService.getStatus(currentUserId, profileUserId);
        setConversationStatus(status);
      } catch (_error) {
        if (setNotification) {
          setNotification({
            message: 'Request failed',
            type: 'error',
          });
        }
      }
      return;
    }

    // Case 5: No conversation exists - send a new request
    if (!conversationStatus.exists) {
      try {
        if (!currentUserId || !profileUserId) return;
        await dmService.sendDMRequest(currentUserId, profileUserId);
        // if (setNotification) {
        //   setNotification({
        //     message: 'Request sent!',
        //     type: 'success',
        //   });
        // }
        // Refresh the button status
        if (!currentUserId || !profileUserId) return;
        const status: IConversationStatus = await dmService.getStatus(currentUserId, profileUserId);
        setConversationStatus(status);
      } catch (_error) {
        if (setNotification) {
          setNotification({
            message: 'Request failed',
            type: 'error',
          });
        }
      }
    }
  };

  // Determine button text and icon based on conversation status
  let buttonText: string;
  let buttonIcon = faCommentDots;
  let buttonClass = 'request-chat';

  if (conversationStatus.exists) {
    if (conversationStatus.status === 'approved') {
      buttonText = 'Open Chat';
      buttonIcon = faMessage;
      buttonClass = 'open-chat';
    } else if (conversationStatus.status === 'pending') {
      // If current user initiated the pending request
      if (conversationStatus.lastRequesterId === currentUserId) {
        buttonText = 'Awaiting Response';
        buttonIcon = faClock;
        buttonClass = 'request-pending';
      } else {
        // The other user initiated the request
        buttonText = 'Respond to Request';
        buttonIcon = faMessage;
        buttonClass = 'respond-request';
      }
    } else {
      // Status is 'closed'
      buttonText = 'Request New Chat';
      buttonIcon = faCommentDots;
      buttonClass = 'request-chat';
    }
  } else {
    buttonText = 'Request Chat';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`dm-button ${buttonClass}`}
      disabled={
        conversationStatus.status === 'pending' &&
        conversationStatus.lastRequesterId === currentUserId
      }
    >
      <FontAwesomeIcon icon={buttonIcon} />
      <span>{buttonText}</span>
    </button>
  );
};

export default RequestButton;
