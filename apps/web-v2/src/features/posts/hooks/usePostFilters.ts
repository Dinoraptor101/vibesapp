/**
 * Post Feed Filters Hook
 *
 * Manages filter state for the posts feed including nearby posts,
 * following filter, MBTI filter, and sort options.
 */

import { useState, useCallback, useEffect } from 'react';
import type { PostFilters } from '../types';

export type SortOption = 'recent' | 'popular' | 'nearby';

export interface FeedFilters extends PostFilters {
  sort: SortOption;
}

interface UsePostFiltersReturn {
  filters: FeedFilters;
  setNearby: (enabled: boolean) => void;
  setFollowing: (enabled: boolean) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;
  isFiltering: boolean;
}

// Get user's current location
async function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

const DEFAULT_NEARBY_RADIUS = 10000; // 10km in meters

/**
 * Hook for managing post feed filters
 */
export function usePostFilters(): UsePostFiltersReturn {
  const [filters, setFilters] = useState<FeedFilters>({
    sort: 'recent',
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, []);

  // Enable/disable nearby filter
  const setNearby = useCallback(
    (enabled: boolean) => {
      setFilters((prev) => {
        if (!enabled) {
          // Remove nearby filter - create new object without 'nearby' key
          const newFilters: FeedFilters = { sort: prev.sort };
          if (prev.following) newFilters.following = prev.following;
          if (prev.userId) newFilters.userId = prev.userId;
          if (prev.includeHidden) newFilters.includeHidden = prev.includeHidden;
          return newFilters;
        }

        // Add nearby filter with current location
        if (!userLocation) {
          console.warn('Location not available for nearby filter');
          return prev;
        }

        return {
          ...prev,
          nearby: {
            lat: userLocation.lat,
            lon: userLocation.lon,
            radius: DEFAULT_NEARBY_RADIUS,
          },
        };
      });
    },
    [userLocation]
  );

  // Enable/disable following filter
  const setFollowing = useCallback((enabled: boolean) => {
    setFilters((prev) => {
      if (!enabled) {
        // Remove following filter - create new object without 'following' key
        const newFilters: FeedFilters = { sort: prev.sort };
        if (prev.nearby) newFilters.nearby = prev.nearby;
        if (prev.userId) newFilters.userId = prev.userId;
        if (prev.includeHidden) newFilters.includeHidden = prev.includeHidden;
        return newFilters;
      }

      return {
        ...prev,
        following: true,
      };
    });
  }, []);

  // Set sort option
  const setSort = useCallback((sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({ sort: 'recent' });
  }, []);

  // Check if any filters are active (excluding sort)
  const isFiltering = !!(filters.nearby || filters.following || filters.userId);

  return {
    filters,
    setNearby,
    setFollowing,
    setSort,
    resetFilters,
    isFiltering,
  };
}
