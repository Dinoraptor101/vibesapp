/**
 * Service for managing user activity-related operations.
 * Handles fetching user activities (Bell page) and checking unread status.
 * Provides methods to interact with the activities API endpoints.
 */

import { logDebug } from '../utils/utils';
import apiService from './apiService';

const ACTIVITIES_API_URL = '/api/activities';

// Fetch activities for a user (by originalPosterId)
export const getActivities = async (originalPosterId: string) => {
  try {
    const response = await apiService.get(`${ACTIVITIES_API_URL}/${originalPosterId}`);
    logDebug('Fetched activities successfully');
    return response.data;
  } catch (error) {
    logDebug('Error fetching activities');
    throw error;
  }
};

// Fetch unread status for a user
export const getUnreadActivities = async (userId: string) => {
  try {
    const response = await apiService.get(`${ACTIVITIES_API_URL}/unread/${userId}`);
    return Boolean(response.data.hasUnread);
  } catch (error) {
    logDebug(`Error fetching unread status via API: ${error}`);
  }
};
