/**
 * Collection of core utility functions for the application.
 * Includes geographic calculations, URL generation, formatting,
 * UUID generation, and debugging utilities.
 */

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon1 - lon2) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * ReadOnly Images Url Returns Low or Full resolution of the image.
 * TODO: We have to implement the logic to get the low resolution image in Lambda trigger
 */
export const getImageUrl = (imagePath: string, resolution: 'low' | 'full'): string => {
  const baseUrl = process.env.REACT_APP_CDN_URL || '';
  if (resolution === 'full') {
    return `${baseUrl}/${imagePath}`;
  } else {
    return `${baseUrl}/${imagePath}`;
  }
};

export const getPresignedUrl = '/api/s3/s3Url';

export const formatDistance = (distance: number | null): string => {
  if (distance === null) {
    return 'unknown distance';
  }
  if (distance < 1) {
    return 'within a mile';
  } else {
    return `${Math.ceil(distance)} miles away`;
  }
};

export const logDebug = (...messages: unknown[]) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.log('[DEBUG]', ...messages);
  }
};

/**
 * Executes a callback function and logs the time it takes to execute if debugging is enabled.
 *
 * @param label - A label to identify the timing log.
 * @param callback - The function to be executed and timed.
 *
 * @example
 * ```typescript
 * timeDebug('fetchData', () => {
 *   fetchData();
 * });
 * ```
 */
export const timeDebug = (label: string, callback: () => void) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.time(label);
    callback();
    console.timeEnd(label);
  } else {
    callback();
  }
};

export function convertErrorToMessage(error: unknown): string {
  let errorMessage: string;

  if (error instanceof Error) {
    // If error is an instance of Error, use its message
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    // If error is an object and has a response property
    const err = error as { response?: { data?: { error?: string } } };
    errorMessage = err.response?.data?.error || 'An unknown error occurred';
  } else {
    // Fallback for other types of errors
    errorMessage = 'An unknown error occurred';
  }
  return errorMessage;
}
