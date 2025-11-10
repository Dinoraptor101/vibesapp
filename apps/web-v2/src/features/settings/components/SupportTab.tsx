import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const APP_VERSION = '2.0.0';
const FEEDBACK_URL = 'https://t.me/Dnegai';

export function SupportTab() {
  const handleFeedbackClick = () => {
    window.open(FEEDBACK_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 pb-8 space-y-6">
      {/* Help & Feedback */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Help & Feedback
        </h3>
        <Button
          onClick={handleFeedbackClick}
          variant="secondary"
          className="w-full justify-between"
        >
          <span>Send Feedback</span>
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Legal */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legal</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-400"
            disabled
          >
            Terms of Service
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-400"
            disabled
          >
            Privacy Policy
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Coming soon...</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* App Version */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          App Version: <span className="font-medium">{APP_VERSION}</span>
        </p>
      </div>
    </div>
  );
}
