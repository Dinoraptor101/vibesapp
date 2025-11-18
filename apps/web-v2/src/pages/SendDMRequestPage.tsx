/**
 * SendDMRequestPage
 * ZEN-style page for sending DM requests
 * - Auto-submits on blur (no submit button)
 * - Navigation instead of modal
 * - Clean, focused layout
 */

import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Textarea } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { useSendDMRequest } from '@/features/messaging/hooks/useSendDMRequest';

const MAX_MESSAGE_LENGTH = 200;
const SHOW_COUNTER_THRESHOLD = 180; // Show counter at 90%

export function SendDMRequestPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const sendRequest = useSendDMRequest();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!userId || hasSubmitted || !message.trim()) return;

    // Check if over limit
    if (message.length > MAX_MESSAGE_LENGTH) {
      console.error('Message too long, not submitting');
      return;
    }

    setHasSubmitted(true);
    sendRequest.mutate(
      { userId, message: message.trim() },
      {
        onSuccess: () => {
          // Navigate back to profile after successful send
          navigate(`/profile/${userId}`);
        },
        onError: (error) => {
          console.error('Failed to send DM request:', error);
          setHasSubmitted(false); // Allow retry on error
        },
      }
    );
  };

  const showCounter = message.length >= SHOW_COUNTER_THRESHOLD;
  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;

  // ZEN: Don't show errors to user
  if (!userId || !user) {
    console.error('Missing userId or user');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Send DM Request</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-4">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            placeholder="Hi! I'd like to connect with you..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={6}
            error={isOverLimit}
            disabled={hasSubmitted}
            className="text-base"
          />

          {/* Character Counter */}
          {showCounter && (
            <p
              className={`text-right text-sm ${
                isOverLimit
                  ? 'text-red-500 dim:text-red-400 dark:text-red-400'
                  : 'text-gray-500 dim:text-gray-400 dark:text-gray-400'
              }`}
            >
              {message.length} / {MAX_MESSAGE_LENGTH}
              {isOverLimit && ' (too long)'}
            </p>
          )}

          {/* Send Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSend}
            loading={hasSubmitted}
            disabled={!message.trim() || isOverLimit || hasSubmitted}
            fullWidth
          >
            Send Request
          </Button>
        </div>
      </div>
    </div>
  );
}
