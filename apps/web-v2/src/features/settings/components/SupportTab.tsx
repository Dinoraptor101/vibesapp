import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/constants';
import { getBuildVersion } from '@/utils/versionCheck';

const FEEDBACK_URL = 'https://t.me/Dnegai';

export function SupportTab() {
  const [buildVersion, setBuildVersion] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get build version after component mounts to ensure DOM is ready
    const version = getBuildVersion();
    setBuildVersion(version);
  }, []);

  const handleTelegramClick = () => {
    window.open(FEEDBACK_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Feedback Link */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-3">
          Help & Feedback
        </h3>
        <div className="space-y-2">
          <Button
            onClick={() => navigate('/feedback')}
            variant="secondary"
            className="w-full justify-start"
            data-testid="submit-feedback-button"
          >
            Submit Bug or Feature Request
          </Button>
          <Button
            onClick={handleTelegramClick}
            variant="secondary"
            className="w-full justify-start gap-2"
            data-testid="support-telegram-button"
          >
            <span>Message us on Telegram</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700" />

      {/* Legal */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-3">
          Legal
        </h3>
        <div className="space-y-2">
          <Button
            onClick={() => navigate('/terms')}
            variant="secondary"
            className="w-full justify-start"
          >
            Terms of Service
          </Button>
          <Button
            onClick={() => navigate('/privacy')}
            variant="secondary"
            className="w-full justify-start"
          >
            Privacy Policy
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dim:border-gray-600 dark:border-gray-700" />

      {/* App Version */}
      <div>
        <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
          App Version: <span className="font-medium">{APP_VERSION}</span>
        </p>
        {buildVersion && (
          <p className="text-xs text-gray-400 dim:text-gray-500 dark:text-gray-500 mt-1">
            Build ID: <span className="font-mono">{buildVersion}</span>
          </p>
        )}
      </div>

      {/* Made with love */}
      <div className="pt-4 text-center">
        <p className="text-xs text-gray-400 dim:text-gray-500 dark:text-gray-500">
          Made with 💜 by Dima & Renamon
        </p>
      </div>
    </div>
  );
}
