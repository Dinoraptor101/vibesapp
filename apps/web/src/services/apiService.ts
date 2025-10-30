/**
 * Service for handling HTTP requests to the backend API.
 * Provides a centralized client for making API calls with proper headers and error handling.
 * Includes methods for CRUD operations, health checks, and reCAPTCHA validation.
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { getCookie } from '../utils/cookieUtils';
import { logDebug } from '../utils/utils';

class ApiService {
  private client: AxiosInstance;
  private apiKey: string | undefined;
  private isRecaptchaEnabled: boolean;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
    this.apiKey = process.env.REACT_APP_BACKEND_API_KEY;
    this.isRecaptchaEnabled = process.env.REACT_APP_ENABLE_RECAPTCHA === 'true';
  }

  async get(url: string): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.get(url, { headers });
      return response;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  }

  async post<T>(url: string, data: T): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.post(url, data, { headers });
      return response;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  }

  async put<T>(url: string, data: T): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.put(url, data, { headers });
      return response;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Delete uses unique logic to send the userId in the body of the request
   * @param url (required) | The URL to send the DELETE request to
   * @param userId (required) | The userId attempting to delete the post.
   * @returns Promise<AxiosResponse>
   */
  async delete(url: string, userId: string): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const data = { userId };
      const response = await this.client.request({
        method: 'delete',
        url,
        headers,
        data,
        maxBodyLength: Infinity,
      });
      return response;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.get('/api/health', { headers });
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async validateRecaptchaToken(token: string): Promise<boolean> {
    if (!this.isRecaptchaEnabled) {
      logDebug('Skipping reCAPTCHA validation');
      return true;
    }

    // Skip validation in development
    if (process.env.NODE_ENV !== 'production') {
      logDebug('Skipping reCAPTCHA validation in development');
      return true;
    }

    try {
      const headers = this._getHeaders();
      const response = await this.client.post('/api/recaptcha', { token }, { headers });

      if (response.status !== 200) {
        console.error('Recaptcha verification failed with status:', response.status);
        return false;
      }

      const responseData = response.data;

      if (!responseData.success) {
        console.error('Recaptcha token validation failed');
        return false;
      }

      logDebug('Recaptcha token validation succeeded');
      return true;
    } catch (error) {
      console.error('Recaptcha validation error:', error);
      return false;
    }
  }

  async updateUserPolarity(userId: string, polarity: string): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.put(`/api/users/${userId}`, { polarity }, { headers });
      return response;
    } catch (error) {
      console.error(`PUT /api/users/${userId} polarity update failed:`, error);
      throw error;
    }
  }

  async updateUserMBTIPersonality(userId: string, mbtiPersonality: string): Promise<AxiosResponse> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.put(
        `/api/users/${userId}`,
        { mbtiPersonality },
        { headers }
      );
      return response;
    } catch (error) {
      console.error(`PUT /api/users/${userId} MBTI personality update failed:`, error);
      throw error;
    }
  }

  private _getHeaders(): {
    'X-Api-Key': string | undefined;
    'X-Pigeon-Id': string | undefined;
  } {
    const pigeonId = getCookie('pigeonId');
    return {
      'X-Api-Key': this.apiKey,
      'X-Pigeon-Id': pigeonId,
    };
  }

  // Public getter to expose the client
  public getClient(): AxiosInstance {
    return this.client;
  }
}

const backendUri = process.env.REACT_APP_BACKEND_URI;
if (!backendUri) {
  throw new Error('REACT_APP_BACKEND_URI is not defined');
}

const apiService = new ApiService(backendUri);
export default apiService;
