/**
 * Post Feed Filters Hook
 *
 * Manages filter state for the posts feed with mutually exclusive tabs.
 * Phase 4.9 (Nov 17, 2025): Simplified to tab-based filtering
 * Bug Fix: Uses cached location only, never prompts for GPS
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  getProximityRadiusMeters,
  PROXIMITY_STORAGE_KEY,
} from '@/features/settings/constants/proximity';
import { locationService } from '@/lib/locationService';
import type { FeedTab } from '../components/FilterBar';
import type { PostFilters } from '../types';

interface UsePostFiltersReturn {
  filters: PostFilters;
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  isFiltering: boolean;
  hasLocation: boolean;
  locationChecked: boolean; // True once location check is complete (success or failure)
}

/**
 * Hook for managing post feed filters with tab-based navigation
 * Bug Fix: Uses cached location only, never prompts for GPS
 */
export function usePostFilters(): UsePostFiltersReturn {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('nearby');
  const [filters, setFilters] = useState<PostFilters>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const [proximityRadius, setProximityRadius] = useState(getProximityRadiusMeters);

  // Get cached user location on mount (never prompts for GPS)
  useEffect(() => {
    // For nearby posts, we just need coordinates (city/state not required)
    locationService.getCoordinates(user || undefined).then((coordinates) => {
      if (coordinates) {
        setUserLocation({ lat: coordinates.lat, lon: coordinates.lon });
      }
      setLocationChecked(true); // Mark check as complete regardless of result
    });
  }, [user]);

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
    locationChecked,
  };
}
