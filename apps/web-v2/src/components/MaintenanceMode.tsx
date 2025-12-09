/**
 * Maintenance Mode Page
 * Shows when VITE_MAINTENANCE_MODE=true
 */

export function MaintenanceMode() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dim:bg-gray-900 dark:bg-gray-900">
      {/* Yin-Yang Icon */}
      <div className="mb-8 animate-pulse">
        <svg
          className="w-24 h-24 text-black dim:text-white dark:text-white"
          viewBox="0 0 100 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="VibesApp maintenance mode"
          role="img"
        >
          <title>VibesApp Under Maintenance</title>
          {/* Yin-Yang Circle */}
          <circle cx="50" cy="50" r="50" fill="currentColor" />
          <path
            d="M50 0 C27.909 0, 10 17.909, 10 40 C10 55.464, 18.954 68.750, 31.25 75 C43.546 81.250, 50 75, 50 75 C50 75, 56.454 81.250, 68.75 75 C81.046 68.750, 90 55.464, 90 40 C90 17.909, 72.091 0, 50 0 Z"
            fill="white"
          />
          <circle cx="35" cy="35" r="6" fill="currentColor" />
          <circle cx="65" cy="65" r="6" fill="white" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 dim:text-white dark:text-white mb-3 text-center">
        Under Maintenance
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-600 dim:text-gray-300 dark:text-gray-300 mb-8 text-center max-w-md">
        We'll be back soon!
      </p>

      {/* Optional: Status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dim:text-gray-400 dark:text-gray-400">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span>Deployment in progress</span>
      </div>
    </div>
  );
}
