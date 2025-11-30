/**
 * SettingsPage - User settings with tabs for Account, Preferences, and Support
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { AccountTab } from '@/features/settings/components/AccountTab';
import { PreferencesTab } from '@/features/settings/components/PreferencesTab';
import { SupportTab } from '@/features/settings/components/SupportTab';

type Tab = 'account' | 'preferences' | 'support';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-0 border-b border-gray-200 dim:border-gray-600 dark:border-gray-700">
          <button
            type="button"
            data-testid="account-section"
            onClick={() => setActiveTab('account')}
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === 'account'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dim:text-gray-500 dark:text-gray-400 hover:text-gray-900 dim:hover:text-gray-150 dark:hover:text-gray-200'
            }`}
          >
            Account
            {activeTab === 'account' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dim:bg-brand-500 dark:bg-brand-400" />
            )}
          </button>
          <button
            type="button"
            data-testid="preferences-section"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === 'preferences'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dim:text-gray-500 dark:text-gray-400 hover:text-gray-900 dim:hover:text-gray-150 dark:hover:text-gray-200'
            }`}
          >
            Preferences
            {activeTab === 'preferences' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dim:bg-brand-500 dark:bg-brand-400" />
            )}
          </button>
          <button
            type="button"
            data-testid="privacy-section"
            onClick={() => setActiveTab('support')}
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === 'support'
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dim:text-gray-500 dark:text-gray-400 hover:text-gray-900 dim:hover:text-gray-150 dark:hover:text-gray-200'
            }`}
          >
            Support
            {activeTab === 'support' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dim:bg-brand-500 dark:bg-brand-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div data-testid={`${activeTab}-tab-content`}>
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'support' && <SupportTab />}
      </div>
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function SettingsPage() {
  return (
    <AppLayout>
      <SettingsPageContent />
    </AppLayout>
  );
}
