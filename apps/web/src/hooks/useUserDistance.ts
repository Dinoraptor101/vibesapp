import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { INotification, IPostData } from '../types';
import { calculateDistance, logDebug } from '../utils/utils';
import useLocation from './useLocation';

const useUserDistance = (
  post: IPostData | null,
  // eslint-disable-next-line no-unused-vars
  setNotification: (notification: INotification) => void
) => {
  const [distance, setDistance] = useState<number | null>(null);
  const { location } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (post && location && location.lat !== null && location.lon !== null) {
      try {
        const distanceInMiles = calculateDistance(
          location.lat,
          location.lon,
          post.user.location.lat,
          post.user.location.lon
        );
        setDistance(distanceInMiles);
        logDebug('Calculated distance successfully');
      } catch (err) {
        setNotification({
          message: `Could not math the distance, Racoon will tell the foxes: ${(err as Error).message}`,
          type: 'error',
        });
        logDebug('Error calculating distance:', err);
        posthog.capture('Distance Calculation Failed', {
          error: (err as Error).message,
        });
      }
    } else if (post && (!location || location.lat === null || location.lon === null)) {
      navigate('/');
    }
  }, [post, location, navigate, setNotification]);

  return distance;
};

export default useUserDistance;
