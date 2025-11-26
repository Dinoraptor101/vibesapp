/**
 * Admin Settings Page
 * Configure admin preferences and system settings
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import api, { type ApiResponse } from '../../../lib/api';

export function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reportThreshold, setReportThreshold] = useState('3');
  const [notificationEmail, setNotificationEmail] = useState('');

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response =
          await api.get<ApiResponse<{ reportThreshold: number; notificationEmail: string }>>(
            '/admin/settings'
          );
        if (response.data && response.success) {
          const { reportThreshold: threshold, notificationEmail: email } = response.data;
          setReportThreshold(String(threshold || 3));
          setNotificationEmail(email || '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSaveMessage('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match if changing
    if (newPassword && newPassword !== confirmPassword) {
      setSaveMessage('Passwords do not match');
      return;
    }

    // Validate current password is provided if changing password
    if (newPassword && !currentPassword) {
      setSaveMessage('Current password is required to set a new password');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await api.put<
        ApiResponse<{ reportThreshold: number; notificationEmail: string }>
      >('/admin/settings', {
        ...(newPassword && { currentPassword, newPassword }),
        reportThreshold: Number(reportThreshold),
        notificationEmail: notificationEmail || undefined,
      });

      // Update local state with saved values from response
      if (response.data && response.success) {
        const { reportThreshold: threshold, notificationEmail: email } = response.data;
        setReportThreshold(String(threshold || 3));
        setNotificationEmail(email || '');
      }

      setSaveMessage('Settings saved successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure admin preferences and system settings</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure admin preferences and system settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admin Password */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Admin Password</h2>
            <p className="text-sm text-gray-600">Change your admin panel password</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Required to change password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Confirm your new password"
              />
            </div>
          </CardContent>
        </Card>

        {/* Moderation Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Moderation Settings</h2>
            <p className="text-sm text-gray-600">Configure automatic moderation rules</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="reportThreshold" className="block text-sm font-medium text-gray-700">
                Auto-Hide Threshold
              </label>
              <input
                id="reportThreshold"
                type="number"
                min="1"
                max="10"
                value={reportThreshold}
                onChange={(e) => setReportThreshold(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of nearby reports (within 50 miles) before a post is automatically hidden
                (default: 3)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">Email notifications for urgent actions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="notificationEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Notification Email
              </label>
              <input
                id="notificationEmail"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="admin@vibesapp.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Receive alerts when posts are auto-hidden or urgent actions are needed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>

          {saveMessage && (
            <p
              className={`text-sm ${
                saveMessage.includes('success') ? 'text-success-600' : 'text-error-600'
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
