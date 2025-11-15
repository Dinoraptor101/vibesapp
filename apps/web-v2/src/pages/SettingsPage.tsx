/**
 * SettingsPage - User settings with tabs for Account, Preferences, and Support
 */

import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountTab } from '@/features/settings/components/AccountTab';
import { PreferencesTab } from '@/features/settings/components/PreferencesTab';
import { SupportTab } from '@/features/settings/components/SupportTab';

type Tab = 'account' | 'preferences' | 'support';

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('account');

  return (
    <div className="min-h-screen bg-gray-50 dim:bg-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dim:bg-gray-700 dark:bg-gray-800 border-b border-gray-200 dim:border-gray-600 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dim:hover:bg-gray-600 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-0 border-b border-gray-200 dim:border-gray-600 dark:border-gray-700">
            <button
              type="button"
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
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'support' && <SupportTab />}
      </div>
    </div>
  );
}
