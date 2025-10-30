// Notification-related type definitions
export interface INotification {
  message: string;
  onClose?: () => void;
  type: string;
}

// Extended notification interface for future use
export interface INotificationExtended {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: string;
  onClose?: () => void;
}
