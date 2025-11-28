/**
 * DMRequestCard Component
 * Displays a single DM request with accept/decline actions
 */

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button } from '@/components/ui-next';
import { useAcceptDMRequest } from '../hooks/useAcceptDMRequest';
import { useDeclineDMRequest } from '../hooks/useDeclineDMRequest';
import type { DMRequest } from '../types';

interface DMRequestCardProps {
  request: DMRequest;
}

export function DMRequestCard({ request }: DMRequestCardProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const navigate = useNavigate();
  const acceptMutation = useAcceptDMRequest();
  const declineMutation = useDeclineDMRequest();

  const sender = request.sender;
  if (!sender) return null;

  const handleAccept = () => {
    acceptMutation.mutate(request._id, {
      onSuccess: (data) => {
        // Navigate to the conversation after accepting
        if (data.conversation?._id) {
          navigate(`/messages/${data.conversation._id}`);
        }
      },
    });
  };

  const handleDecline = () => {
    declineMutation.mutate(request._id);
  };

  const messagePreview =
    request.message && request.message.length > 100
      ? request.message.substring(0, 100) + '...'
      : request.message;

  const showExpandLink = request.message && request.message.length > 100;
  const isPending = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div
      className="rounded-lg border border-border bg-surface-elevated p-4"
      data-testid={`dm-request-${request._id}`}
    >
      {/* Sender Info */}
      <div className="mb-3 flex items-start gap-3">
        <Avatar
          src={sender.profilePictureUrl}
          alt={sender.username}
          name={sender.username}
          size="md"
          data-testid="requester-avatar"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary" data-testid="requester-username">
              {sender.username}
            </span>
            {sender.mbtiPersonality && (
              <Badge variant="brand" size="sm">
                {sender.mbtiPersonality}
              </Badge>
            )}
          </div>

          <p className="text-sm text-text-tertiary">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Request Message */}
      {request.message && (
        <div className="mb-4 rounded bg-surface-hover p-3" data-testid="request-message">
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {showFullMessage ? request.message : messagePreview}
          </p>
          {showExpandLink && (
            <button
              type="button"
              onClick={() => setShowFullMessage(!showFullMessage)}
              className="mt-1 text-sm text-brand-primary hover:underline"
            >
              {showFullMessage ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAccept}
          loading={acceptMutation.isPending}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700"
          data-testid="accept-request-button"
        >
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecline}
          loading={declineMutation.isPending}
          disabled={isPending}
          className="flex-1"
          data-testid="decline-request-button"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
