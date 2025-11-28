/**
 * Post Feed Filters Hook
 *
 * Manages filter state for the posts feed with mutually exclusive tabs.
 * Phase 4.9 (Nov 17, 2025): Simplified to tab-based filtering
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  getProximityRadiusMeters,
  PROXIMITY_STORAGE_KEY,
} from '@/features/settings/constants/proximity';
import type { FeedTab } from '../components/FilterBar';
import type { PostFilters } from '../types';

interface UsePostFiltersReturn {
  filters: PostFilters;
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  isFiltering: boolean;
  hasLocation: boolean;
}

// Get user's current location from multiple sources
async function getUserLocation(userProfileLocation?: {
  latitude: number;
  longitude: number;
}): Promise<{ lat: number; lon: number } | null> {
  // Try browser geolocation first
  const browserLocation = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
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
        console.error('Browser geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });

  if (browserLocation) {
    return browserLocation;
  }

  // Fall back to user's profile location
  if (userProfileLocation) {
    return {
      lat: userProfileLocation.latitude,
      lon: userProfileLocation.longitude,
    };
  }

  return null;
}

/**
 * Hook for managing post feed filters with tab-based navigation
 */
export function usePostFilters(): UsePostFiltersReturn {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('nearby');
  const [filters, setFilters] = useState<PostFilters>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [proximityRadius, setProximityRadius] = useState(getProximityRadiusMeters);

  // Get user location on mount
  useEffect(() => {
    getUserLocation(user?.location).then((location) => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, [user?.location]);

  // Listen for localStorage changes (when user updates proximity in settings)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PROXIMITY_STORAGE_KEY) {
        setProximityRadius(getProximityRadiusMeters());
      }
    };

    // Also check periodically for same-tab changes (storage event doesn't fire for same tab)
    const checkProximity = () => {
      const current = getProximityRadiusMeters();
      setProximityRadius((prev) => (prev !== current ? current : prev));
    };

    window.addEventListener('storage', handleStorageChange);
    // Check when tab becomes visible (user may have changed settings)
    document.addEventListener('visibilitychange', checkProximity);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', checkProximity);
    };
  }, []);

  // Update filters when tab changes or proximity changes
  useEffect(() => {
    if (activeTab === 'nearby') {
      // Nearby tab: Posts within proximity radius (from settings)
      if (!userLocation) {
        // ZEN: Don't warn, just show empty filters (backend will handle it)
        setFilters({});
        return;
      }

      setFilters({
        nearby: {
          lat: userLocation.lat,
          lon: userLocation.lon,
          radius: proximityRadius,
        },
      });
    } else {
      // Following tab: Posts from people you follow
      setFilters({
        following: true,
      });
    }
  }, [activeTab, userLocation, proximityRadius]);

  // Check if any filters are active
  const isFiltering = !!(filters.nearby || filters.following);

  return {
    filters,
    activeTab,
    setActiveTab,
    isFiltering,
    hasLocation: !!userLocation,
  };
}
