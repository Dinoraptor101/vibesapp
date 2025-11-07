import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Copy } from 'lucide-react';
/**
 * Modal for displaying regenerated password with copy functionality
 */
import { useState } from 'react';

interface RegeneratePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: string | null;
  userName: string;
}

export function RegeneratePasswordModal({
  isOpen,
  onClose,
  password,
  userName,
}: RegeneratePasswordModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Password Regenerated Successfully</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New password generated for <strong>{userName}</strong>. Please copy this password and
            send it to the user securely. This password will not be shown again.
          </p>

          {/* Password Display */}
          <div className="rounded-lg border-2 border-brand/20 bg-brand/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                {password}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy} className="flex-shrink-0">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-success-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20 p-3">
            <p className="text-sm text-warning-800 dark:text-warning-200">
              ⚠️ <strong>Important:</strong> This password will not be shown again after closing this
              modal. Make sure to copy it before proceeding.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCopy} disabled={copied}>
              {copied ? 'Copied to Clipboard' : 'Copy Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
