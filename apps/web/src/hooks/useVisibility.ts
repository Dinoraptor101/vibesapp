import { useEffect, useState } from 'react';

/**
 * A custom hook that tracks the visibility state of the document.
 * Returns true when the document/tab is visible and false when it's hidden.
 * Useful for managing functionality that should only run when the user is actively viewing the page.
 * @returns {boolean} The current visibility state of the document
 */
const useVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default useVisibility;
