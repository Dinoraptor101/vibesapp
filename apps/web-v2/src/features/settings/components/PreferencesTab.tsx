import { useState } from 'react';
import { useAccountUpdates } from '../hooks/useAccountUpdates';

const PROXIMITY_OPTIONS = [
  { value: 50, label: '50 kilometers' },
  { value: 100, label: '100 kilometers' },
  { value: 150, label: '150 kilometers' },
];

export function PreferencesTab() {
  const { queueUpdate } = useAccountUpdates();
  const [proximityRange, setProximityRange] = useState(100); // Default 100km

  const handleProximityChange = (newRange: number) => {
    setProximityRange(newRange);
    queueUpdate({ proximityRange: newRange });
  };

  return (
    <div className="p-4 pb-8 space-y-6">
      {/* Proximity Range */}
      <div>
        <label htmlFor="proximity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nearby Posts Radius
        </label>
        <select
          id="proximity"
          value={proximityRange}
          onChange={(e) => handleProximityChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {PROXIMITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Determines the range for posts shown in your Nearby feed.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Future Settings */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notification settings coming soon...
        </p>
      </div>
    </div>
  );
}
