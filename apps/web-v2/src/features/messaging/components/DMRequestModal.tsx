/**
 * DMRequestModal Component
 * Modal for sending DM request with optional message
 */

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui-next';
import { useSendDMRequest } from '../hooks/useSendDMRequest';

interface DMRequestModalProps {
  userId: string;
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_MESSAGE_LENGTH = 200;
const SHOW_COUNTER_THRESHOLD = 180; // Show counter when 90% of limit

export function DMRequestModal({ userId, username, open, onOpenChange }: DMRequestModalProps) {
  const [message, setMessage] = useState('');
  const sendRequest = useSendDMRequest();

  const handleSend = () => {
    sendRequest.mutate(
      { userId, message: message.trim() || undefined },
      {
        onSuccess: () => {
          setMessage('');
          onOpenChange(false);
        },
      }
    );
  };

  const showCounter = message.length >= SHOW_COUNTER_THRESHOLD;
  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            Request DM with @{username}
          </DialogTitle>
          <DialogDescription>
            Send an optional message with your DM request. @{username} can accept or decline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="dm-message"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Message (optional)
            </label>
            <Textarea
              id="dm-message"
              placeholder={`Hi! I'd like to connect with you...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={4}
              error={isOverLimit}
              helperText={
                isOverLimit
                  ? `Message is too long (${message.length}/${MAX_MESSAGE_LENGTH})`
                  : undefined
              }
            />
            {showCounter && !isOverLimit && (
              <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                {message.length} / {MAX_MESSAGE_LENGTH}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMessage('');
                onOpenChange(false);
              }}
              disabled={sendRequest.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={sendRequest.isPending}
              disabled={isOverLimit || sendRequest.isPending}
            >
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
