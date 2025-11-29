/**
 * PWA Install Prompt Component
 *
 * Guides mobile users to install the app on their home screen for the best experience.
 * Follows ZEN principles: clear, helpful, non-coercive guidance.
 *
 * Features:
 * - Platform-specific instructions (iOS Safari vs Android Chrome)
 * - Full-screen modal for clarity
 * - 7-day dismissal period (localStorage)
 * - Mobile-only (excludes tablets/desktop)
 * - "Continue in browser" option (small, unobtrusive)
 */

import { Download, Share, MoreVertical, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_DAYS = 7;

// ⚠️ DEBUG: Uncomment ONE of these lines to test on desktop
// const DEBUG_FORCE_PLATFORM: 'ios' | 'android' | null = 'ios';
// const DEBUG_FORCE_PLATFORM: 'ios' | 'android' | null = 'android';
const DEBUG_FORCE_PLATFORM: 'ios' | 'android' | null = null; // Normal behavior

/**
 * Detect if running as installed PWA
 */
function isInstalledPWA(): boolean {
  // Check if running in standalone mode (installed PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  // iOS Safari standalone check
  if (
    'standalone' in window.navigator &&
    (window.navigator as Navigator & { standalone: boolean }).standalone
  ) {
    return true;
  }
  return false;
}

/**
 * Detect if device is a mobile phone (not tablet)
 */
function isMobilePhone(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for tablets first (to exclude them)
  const isTablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent);
  if (isTablet) return false;

  // Check for mobile phones
  const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(
    userAgent
  );

  // Also check screen width as fallback (phones typically < 768px)
  const isSmallScreen = window.innerWidth < 768;

  return isMobile || isSmallScreen;
}

/**
 * Detect platform for instruction display
 */
function getPlatform(): 'ios' | 'android' | 'other' {
  // DEBUG: Force platform for testing on desktop
  if (DEBUG_FORCE_PLATFORM) return DEBUG_FORCE_PLATFORM;

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'other';
}

/**
 * Check if prompt was recently dismissed
 */
function wasRecentlyDismissed(): boolean {
  const dismissedAt = localStorage.getItem(STORAGE_KEY);
  if (!dismissedAt) return false;

  const dismissedDate = new Date(dismissedAt);
  const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceDismissed < DISMISS_DURATION_DAYS;
}

/**
 * Save dismissal to localStorage
 */
function saveDismissal(): void {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const platform = getPlatform();

  useEffect(() => {
    // DEBUG: Skip checks if forcing platform
    if (DEBUG_FORCE_PLATFORM) {
      if (!wasRecentlyDismissed()) {
        setShowPrompt(true);
      }
      return;
    }

    // Don't show if:
    // 1. Already installed as PWA
    // 2. Not a mobile phone
    // 3. Recently dismissed
    // 4. Unknown platform
    if (isInstalledPWA() || !isMobilePhone() || wasRecentlyDismissed() || platform === 'other') {
      return;
    }

    setShowPrompt(true);
  }, [platform]);

  const handleDismiss = () => {
    saveDismissal();
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white dim:bg-gray-900 dark:bg-gray-950 flex flex-col"
      style={{ isolation: 'isolate' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-prompt-title"
    >
      {/* Continue in browser - Small, grey, top center */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-gray-400 dim:text-gray-500 dark:text-gray-500 hover:text-gray-500 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>continue in browser</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* App Icon */}
        <div className="w-20 h-20 mb-6 rounded-2xl bg-brand flex items-center justify-center shadow-lg">
          <Download className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 id="pwa-prompt-title" className="text-2xl font-semibold text-text-primary mb-3">
          Add to Home Screen
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary mb-8 max-w-xs">
          For the smoothest experience, install VibesApp on your home screen. It's quick, free, and
          works offline.
        </p>

        {/* Platform-specific Instructions */}
        {platform === 'ios' ? <IOSInstructions /> : <AndroidInstructions />}
      </div>

      {/* Footer note */}
      <div className="pb-8 px-6 text-center">
        <p className="text-xs text-gray-400 dim:text-gray-500 dark:text-gray-500">
          The browser experience may have limited functionality
        </p>
      </div>
    </div>
  );
}

/**
 * iOS Safari Installation Instructions
 */
function IOSInstructions() {
  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Step 1 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <Share className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">1. Tap the Share button</p>
          <p className="text-sm text-text-secondary">
            Find it at the bottom of Safari (the square with an arrow pointing up)
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">2. Tap "Add to Home Screen"</p>
          <p className="text-sm text-text-secondary">
            Scroll down in the share menu to find this option
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <span className="text-brand font-semibold">✓</span>
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">3. Tap "Add"</p>
          <p className="text-sm text-text-secondary">
            VibesApp will appear on your home screen like a regular app
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Android Chrome Installation Instructions
 */
function AndroidInstructions() {
  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Step 1 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">1. Tap the menu button</p>
          <p className="text-sm text-text-secondary">
            Find the three dots (⋮) in the top-right corner of Chrome
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">
            2. Tap "Install app" or "Add to Home screen"
          </p>
          <p className="text-sm text-text-secondary">The wording may vary slightly by device</p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex items-start gap-4 text-left p-4 bg-surface-secondary rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <span className="text-brand font-semibold">✓</span>
        </div>
        <div>
          <p className="font-medium text-text-primary mb-1">3. Confirm the installation</p>
          <p className="text-sm text-text-secondary">
            VibesApp will install and appear on your home screen
          </p>
        </div>
      </div>
    </div>
  );
}
