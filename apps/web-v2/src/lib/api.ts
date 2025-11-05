/**
 * API Client for VibesApp
 * Handles all HTTP requests to the backend with proper error handling,
 * authentication, and request/response interceptors.
 */

import axios, { type AxiosError, type AxiosInstance } from 'axios';

// Cookie utility functions
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function setCookie(name: string, value: string, days = 7): void {
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
  private apiKey: string | undefined;

  constructor(baseURL: string) {
    // Get base URL from environment or use provided
    const apiBaseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5001';

    this.client = axios.create({
      baseURL: apiBaseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.apiKey = import.meta.env.VITE_API_KEY;

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth headers
    this.client.interceptors.request.use(
      (config) => {
        // Add API key if available
        if (this.apiKey) {
          config.headers['X-Api-Key'] = this.apiKey;
        }

        // Add Pigeon ID from cookie
        const pigeonId = getCookie('pigeonId');
        if (pigeonId) {
          config.headers['X-Pigeon-Id'] = pigeonId;
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
            // Clear auth cookies
            deleteCookie('pigeonId');
            deleteCookie('userId');
            // Redirect to login (will be handled by auth context)
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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

  async delete<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.delete<T>(url, { data });
    return response.data;
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
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
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const apiClient = new ApiClient(apiBaseURL);

export default apiClient;
export { getCookie, setCookie, deleteCookie };
