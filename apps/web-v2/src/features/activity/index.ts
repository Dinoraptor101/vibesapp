/**
 * Activity Feature Exports
 *
 * Central export point for the Activity Feed feature (Phase 4.5)
 */

// Types
export type { Activity, ActivityCategory, ActivityCounts, ActivityType } from './types';

// API Service
export { activityService } from './api/activityService';

// Hooks
export {
  useActivities,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadCounts,
  useHasUnread,
  useDeleteActivity,
} from './hooks/useActivities';

// Components
export { ActivityCard } from './components/ActivityCard';
export { ActivityList } from './components/ActivityList';
