/**
 * Enhanced API service with better error handling, typing, and request management
 */
import {
  ApiError,
  type ApiResponse,
  type ApiServiceHeaders,
  type RequestConfig,
} from '../../types/api';
import { getCookie } from '../../utils/cookieUtils';
import { logDebug } from '../../utils/utils';

export class BaseApiService {
  private static readonly baseURL = process.env.REACT_APP_BACKEND_URI;
  private static readonly timeout = 10000; // 10 seconds
  private static readonly maxRetries = 2;

  /**
   * Enhanced request method with timeout, retry logic, and proper error handling
   */
  static async request<T>(endpoint: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    if (!BaseApiService.baseURL) {
      throw new ApiError(500, 'API base URL is not configured');
    }

    const { timeout = BaseApiService.timeout, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error = new Error('Unknown error occurred during API request');

    // Retry logic
    for (let attempt = 0; attempt <= BaseApiService.maxRetries; attempt++) {
      try {
        const response = await fetch(`${BaseApiService.baseURL}${endpoint}`, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...BaseApiService.getDefaultHeaders(),
            ...fetchOptions.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData: { message?: string; [key: string]: any };

          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }

          throw new ApiError(
            response.status,
            errorData.message || `HTTP ${response.status}`,
            errorData
          );
        }

        const responseData = await response.json();

        // Ensure consistent response format
        return {
          data: responseData.data || responseData,
          success: responseData.success !== false,
          message: responseData.message,
          errors: responseData.errors,
        };
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiError) {
          // Don't retry client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
        }

        if ((error as Error).name === 'AbortError') {
          throw new ApiError(408, 'Request timeout');
        }

        // Only retry for network errors or 5xx errors
        if (attempt === BaseApiService.maxRetries) {
          break;
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
      }
    }

    clearTimeout(timeoutId);
    throw lastError;
  }

  /**
   * GET request helper
   */
  static async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return BaseApiService.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request helper
   */
  static async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return BaseApiService.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  static async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return BaseApiService.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request helper with body support
   */
  static async delete<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return BaseApiService.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Health check endpoint
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await BaseApiService.get('/api/health');
      return response.success;
    } catch (error) {
      logDebug('Health check failed:', error);
      return false;
    }
  }

  /**
   * Validate reCAPTCHA token
   */
  static async validateRecaptcha(token: string): Promise<boolean> {
    const isRecaptchaEnabled = process.env.REACT_APP_ENABLE_RECAPTCHA === 'true';

    if (!isRecaptchaEnabled || process.env.NODE_ENV !== 'production') {
      logDebug('Skipping reCAPTCHA validation');
      return true;
    }

    try {
      const response = await BaseApiService.post<{ success: boolean }>('/api/recaptcha', { token });
      return response.data.success;
    } catch (error) {
      logDebug('reCAPTCHA validation error:', error);
      return false;
    }
  }

  /**
   * Get default headers for requests
   */
  private static getDefaultHeaders(): ApiServiceHeaders {
    const pigeonId = getCookie('pigeonId');
    return {
      'X-Api-Key': process.env.REACT_APP_BACKEND_API_KEY,
      'X-Pigeon-Id': pigeonId || undefined,
    };
  }
}

export default BaseApiService;
