import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  getStoredProximityKm,
  PROXIMITY_OPTIONS,
  PROXIMITY_STORAGE_KEY,
  type ProximityRadiusKm,
} from '../constants/proximity';
import { useAccountUpdates } from '../hooks/useAccountUpdates';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useUpdatePreferences } from '../hooks/useUpdatePreferences';

const NOTIFICATION_TYPES = [
  {
    key: 'new_follower' as const,
    label: 'New Followers',
    description: 'When someone follows you',
  },
  {
    key: 'following_post' as const,
    label: 'Posts from Following',
    description: 'When someone you follow posts',
  },
  {
    key: 'nearby_post' as const,
    label: 'Nearby Posts',
    description: 'When someone nearby posts',
  },
  {
    key: 'comment' as const,
    label: 'Comments',
    description: 'When someone comments on your post',
  },
  {
    key: 'comment_reply' as const,
    label: 'Comment Replies',
    description: 'When someone replies to your comment',
  },
  {
    key: 'reactions' as const,
    label: 'Reactions',
    description: 'When someone likes your post',
  },
  {
    key: 'post_hidden' as const,
    label: 'Post Moderation',
    description: 'When your post is hidden by community reports',
  },
];

export function PreferencesTab() {
  const { isOnline } = useNetworkStatus();
  const { queueUpdate } = useAccountUpdates();

  // Initialize proximity from localStorage, default to 50km
  const [proximityRange, setProximityRange] = useState<ProximityRadiusKm>(getStoredProximityKm);

  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();

  const handleProximityChange = (newRange: ProximityRadiusKm) => {
    if (!isOnline) return; // Prevent action when offline
    setProximityRange(newRange);
    // Store in localStorage for persistence
    localStorage.setItem(PROXIMITY_STORAGE_KEY, String(newRange));
    // Queue update to backend (for future implementation)
    queueUpdate({ proximityRange: newRange });
  };

  const handleToggleNotification = (key: string) => {
    if (!isOnline || !preferences) return; // Prevent action when offline

    const newValue = !preferences[key as keyof typeof preferences];
    updatePreferences.mutate({ [key]: newValue });
  };
  return (
    <div className="p-4 space-y-6">
      {/* Proximity Range */}
      <div>
        <label
          htmlFor="proximity"
          className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2"
        >
          Nearby Posts Radius
        </label>
        <select
          id="proximity"
          data-testid="proximity-input"
          value={proximityRange}
          onChange={(e) => handleProximityChange(Number(e.target.value) as ProximityRadiusKm)}
          disabled={!isOnline}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {PROXIMITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400 mt-2">
          Determines the range for posts shown in your Nearby feed.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Notification Preferences */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100 mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400 mb-4">
          Choose which activities you want to be notified about
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 dim:bg-gray-700 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {NOTIFICATION_TYPES.map((type) => {
              const isEnabled = preferences?.[type.key] ?? true;

              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleToggleNotification(type.key)}
                  disabled={!isOnline}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dim:border-gray-600 dark:border-gray-700 hover:bg-gray-50 dim:hover:bg-gray-750 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dim:text-gray-100 dark:text-gray-100">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
                      {type.description}
                    </div>
                  </div>

                  <div className="ml-4">
                    {isEnabled ? (
                      <Bell className="w-5 h-5 text-brand-600 dim:text-brand-500 dark:text-brand-400" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400 dim:text-gray-500 dark:text-gray-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
