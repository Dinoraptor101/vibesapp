/**
 * Post Feed Filters Hook
 *
 * Manages filter state for the posts feed with mutually exclusive tabs.
 * Phase 4.9 (Nov 17, 2025): Simplified to tab-based filtering
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import type { FeedTab } from '../components/FilterBar';
import type { PostFilters } from '../types';

interface UsePostFiltersReturn {
  filters: PostFilters;
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  isFiltering: boolean;
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

const DEFAULT_NEARBY_RADIUS = 10000; // 10km in meters

/**
 * Hook for managing post feed filters with tab-based navigation
 */
export function usePostFilters(): UsePostFiltersReturn {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('nearby');
  const [filters, setFilters] = useState<PostFilters>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user location on mount
  useEffect(() => {
    getUserLocation(user?.location).then((location) => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, [user?.location]);

  // Update filters when tab changes
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
          radius: DEFAULT_NEARBY_RADIUS,
        },
      });
    } else {
      // Following tab: Posts from people you follow
      setFilters({
        following: true,
      });
    }
  }, [activeTab, userLocation]);

  // Check if any filters are active
  const isFiltering = !!(filters.nearby || filters.following);

  return {
    filters,
    activeTab,
    setActiveTab,
    isFiltering,
  };
}
