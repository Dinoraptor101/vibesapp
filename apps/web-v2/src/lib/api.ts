/**
 * API Client for VibesApp
 * Handles all HTTP requests to the backend with proper error handling,
 * authentication, and request/response interceptors.
 */

import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { getFirebaseAuth } from './firebase';

// Cookie utility functions
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function setCookie(name: string, value: string, days = 3650): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// API Response type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    // Get base URL from environment or use provided
    const apiBaseURL = baseURL || import.meta.env.VITE_API_URL;

    if (!apiBaseURL) {
      throw new Error('VITE_API_URL environment variable is required');
    }

    this.client = axios.create({
      baseURL: apiBaseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // SECURITY: Do NOT use VITE_BACKEND_API_KEY in browser
    // API key is for server-to-server auth only (internal microservices)
    // Browser auth uses pigeonId cookie via pigeonAuth middleware

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth headers
    this.client.interceptors.request.use(
      async (config) => {
        // SECURITY FIX: Never send API key from browser
        // It would expose the key in DevTools and allow attackers to bypass auth
        // The apiKey middleware checks for this header, but since excludedRoutes
        // includes most public routes, browser requests work without it
        // Only internal server-to-server requests need X-Api-Key
        // if (this.apiKey) {
        //   config.headers['X-Api-Key'] = this.apiKey;
        // }

        // Add Pigeon ID from cookie (legacy auth, kept during migration window)
        const pigeonId = getCookie('pigeonId');
        if (pigeonId) {
          config.headers['X-Pigeon-Id'] = pigeonId;
          if (import.meta.env.VITE_DEBUG) {
            console.log(`[API] Adding pigeonId header: ${pigeonId.substring(0, 8)}...`);
          }
        }

        // Add Firebase ID token (parallel with pigeonId during migration).
        // getIdToken() returns the cached token and silently refreshes near expiry.
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth?.currentUser) {
          try {
            const idToken = await firebaseAuth.currentUser.getIdToken();
            config.headers['Authorization'] = `Bearer ${idToken}`;
          } catch (err) {
            console.warn('[API] Failed to get Firebase ID token:', err);
          }
        }

        if (!pigeonId && !firebaseAuth?.currentUser && import.meta.env.VITE_DEBUG) {
          console.warn('[API] No auth credential found - request will be unauthenticated');
        }

        // Add Admin Token from cookie (for admin routes)
        const adminToken = getCookie('adminToken');
        if (adminToken) {
          config.headers['X-Admin-Token'] = adminToken;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          status: error.response?.status,
        };

        if (error.response) {
          // Server responded with error status
          const data = error.response.data as Record<string, unknown>;
          apiError.message = (data?.message as string) || (data?.error as string) || 'Server error';

          // Handle authentication errors
          if (error.response.status === 401) {
            // 401 = Unauthorized (missing or invalid authentication)
            const requestUrl = error.config?.url || '';

            // Check if this is an admin endpoint
            if (requestUrl.includes('/admin/')) {
              // Admin token is invalid - clear admin auth and trigger logout
              deleteCookie('adminToken');
              deleteCookie('adminSessionExpiry');
              window.dispatchEvent(new CustomEvent('admin:unauthorized'));
            } else {
              // User auth error - only log out if the error indicates the session is truly invalid
              const errorMsg = apiError.message.toLowerCase();
              const isSessionInvalid =
                errorMsg.includes('invalid authentication') ||
                errorMsg.includes('missing authentication') ||
                errorMsg.includes('unauthorized');

              if (isSessionInvalid) {
                // Clear auth cookies and trigger logout
                deleteCookie('pigeonId');
                deleteCookie('userId');
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
              }
            }
          } else if (error.response.status === 403) {
            // 403 = Forbidden (authenticated but not authorized for this resource)
            // This is a permission issue, NOT an auth issue - don't log out
            // Just let the error propagate to be handled by the calling code
          }
        } else if (error.request) {
          // Request made but no response
          apiError.message = 'Network error - please check your connection';
        } else {
          // Something else happened
          apiError.message = error.message;
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string, config?: { data?: unknown }): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get the underlying axios instance if needed
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Create and export a singleton instance
const apiBaseURL = import.meta.env.VITE_API_URL;

if (!apiBaseURL) {
  throw new Error('VITE_API_URL environment variable is required');
}

const apiClient = new ApiClient(apiBaseURL);

export default apiClient;
export { getCookie, setCookie, deleteCookie };
