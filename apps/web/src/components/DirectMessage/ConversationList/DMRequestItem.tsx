import type React from 'react';
import './DMRequestItem.css';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import dmService from '../../../services/dmService';
import type { DMRequestItemProps } from '../../../types';
import { getCookie } from '../../../utils/cookieUtils';

const DMRequestItem: React.FC<DMRequestItemProps> = ({ request, onRequestProcessed }) => {
  const currentUserId = getCookie('userId');
  const navigate = useNavigate();

  const handleRequestAction = async (action: 'approve' | 'decline') => {
    try {
      // Determine if the current user is the sender or recipient
      const isSender = request.senderId === currentUserId;
      const senderId = isSender ? currentUserId : request.senderId;
      const recipientId = isSender ? request.recipientId : currentUserId;

      if (action === 'approve') {
        const response = await dmService.approveDMRequest(currentUserId, senderId, recipientId);

        // Get the conversation ID from the response
        const conversationId = response.data.conversationId;

        // Notify parent component that the request was processed
        if (onRequestProcessed) {
          onRequestProcessed();
        }

        // Navigate to the conversations tab and highlight the new conversation
        navigate('/conversations', {
          state: {
            activeTab: 'conversations',
            conversationId,
          },
        });
      } else {
        await dmService.declineDMRequest(currentUserId, senderId, recipientId);
        if (onRequestProcessed) {
          onRequestProcessed();
        }
      }
    } catch (error) {
      console.error('Failed to process request', error);
    }
  };

  const otherUserName =
    request.senderId === currentUserId ? request.recipientUsername : request.senderUsername;

  return (
    <div className="dm-request-item">
      <div className="dm-request-user">{otherUserName}</div>
      <div className="dm-request-message">
        {request.senderId === currentUserId
          ? 'You sent a message request'
          : 'wants to send you messages'}
      </div>
      {request.recipientId === currentUserId && (
        <div className="dm-request-actions">
          <button
            type="button"
            onClick={() => handleRequestAction('approve')}
            className="approve-button"
            aria-label="Approve request"
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button
            type="button"
            onClick={() => handleRequestAction('decline')}
            className="decline-button"
            aria-label="Decline request"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DMRequestItem;
