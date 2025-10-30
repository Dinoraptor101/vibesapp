export const isIosDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export const isAndroidDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

/**
 * Checks if the application is running in standalone mode.
 *
 * This function determines if the web application is being run as a standalone
 * application (e.g., when added to the home screen on mobile devices) by checking
 * the display mode and the navigator properties.
 *
 * @returns {boolean} `true` if the application is in standalone mode, otherwise `false`.
 */
export const isStandaloneMode = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      typeof window.navigator.standalone === 'boolean' &&
      window.navigator.standalone)
  );
};
