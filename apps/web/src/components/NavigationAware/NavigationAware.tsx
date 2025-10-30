import type React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationAwareProps {
  updateUnreadStatus: () => void;
}

/**
 * Component that tracks navigation changes and triggers status updates.
 *
 * The updateUnreadStatus callback:
 * 1. Checks for unread activity notifications (via activityService)
 * 2. Checks for unread messages and pending DM requests (via dmService)
 * 3. Updates the notification indicators in the navigation bar
 *
 * This callback is triggered:
 * 1. When the user navigates to a different page
 * 2. Periodically every 60 seconds to keep notification status updated
 *
 * This ensures users see up-to-date notification indicators without having
 * to manually refresh the page.
 */
const NavigationAware: React.FC<NavigationAwareProps> = ({ updateUnreadStatus }) => {
  const _location = useLocation();

  useEffect(() => {
    // Check for all types of unread content when navigating
    updateUnreadStatus();

    // Set up an interval to periodically check for new unread content
    const intervalId = setInterval(updateUnreadStatus, 60000); // Check every minute

    return () => {
      clearInterval(intervalId);
    };
  }, [updateUnreadStatus]);

  return null; // This component doesn't render anything
};

export default NavigationAware;
