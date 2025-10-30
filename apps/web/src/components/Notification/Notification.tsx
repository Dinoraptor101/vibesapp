import type React from 'react';
import { useEffect } from 'react';
import './Notification.css';
import type { INotification } from '../../types';

/**
 * A component that displays temporary notification messages to the user.
 * Automatically dismisses after 3 seconds.
 * @param {INotification} props - The notification properties including message, type, and onClose handler
 * @returns {React.ReactElement | null} A notification element or null if required props are missing
 */
const Notification: React.FC<INotification> = ({ message, onClose, type }) => {
  useEffect(() => {
    if (!message || !type || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose, message, type]);

  if (!message || !type) {
    console.error(`Notification component requires ${message ? 'type' : 'message'} prop.`);
    return null;
  }

  return <div className={`notification ${type}`}>{message}</div>;
};

export default Notification;
