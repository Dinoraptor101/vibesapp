import type { AxiosError } from 'axios';
import posthog from 'posthog-js';
import type React from 'react';
import apiService from '../../services/apiService';
import GeoLocationService from '../../services/geoLocationService';
import type { IGeolocationPositionError, ILocation, INotification } from '../../types';
import { setCookie } from '../../utils/cookieUtils';
import { logDebug } from '../../utils/utils';
import HandleReCaptcha from './handleReCaptcha';

// eslint-disable-next-line no-unused-vars
type SetNotification = (notification: INotification) => void;
// eslint-disable-next-line no-unused-vars
type SetLoading = (loading: boolean) => void;
// eslint-disable-next-line no-unused-vars
type SetNewUserId = (userId: string) => void;
// eslint-disable-next-line no-unused-vars
type SetNewPigeonId = (pigeonId: string) => void;
// eslint-disable-next-line no-unused-vars
type SetShowTagMenu = (show: boolean) => void;

/**
 * Handles all form-related operations for the WelcomeForm component including:
 * - User registration with geolocation and reCAPTCHA validation
 * - Input validation for username and age
 * - Management of user IDs (pigeon tags)
 * - Clipboard operations for copying user IDs
 * - Existing user authentication
 * - Integration with PostHog analytics
 *
 * @class
 * @param {Function} setNotification - Updates notification state in parent component
 * @param {Function} setLoading - Updates loading state in parent component
 * @param {Function} setNewUserId - Updates new user ID state in parent component
 * @param {Function} setShowTagMenu - Controls visibility of tag menu in parent component
 */
class WelcomeFormHandler {
  private static instance: WelcomeFormHandler;
  private setNotification: SetNotification;
  private setLoading: SetLoading;
  private setNewUserId: SetNewUserId;
  private setNewPigeonId: SetNewPigeonId;
  private setShowTagMenu: SetShowTagMenu;
  private PIGEON_ID_COOKIE: string;
  private USER_ID_COOKIE: string;
  private isRecaptchaValidated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private grecaptcha: any;
  private handleReCaptcha: HandleReCaptcha;
  private recaptchaCache: Map<string, any>;
  private retryAttempts: number;

  constructor(
    setNotification: SetNotification,
    setLoading: SetLoading,
    setNewUserId: SetNewUserId,
    setNewPigeonId: SetNewPigeonId,
    setShowTagMenu: SetShowTagMenu
  ) {
    this.setNotification = setNotification;
    this.setLoading = setLoading;
    this.setNewUserId = setNewUserId;
    this.setNewPigeonId = setNewPigeonId;
    this.setShowTagMenu = setShowTagMenu;
    this.PIGEON_ID_COOKIE = 'pigeonId';
    this.USER_ID_COOKIE = 'userId';
    this.isRecaptchaValidated = false;
    this.grecaptcha = window.grecaptcha;
    this.recaptchaCache = new Map();
    this.retryAttempts = 0;
    this.handleReCaptcha = new HandleReCaptcha();
  }

  static getInstance(
    setNotification: SetNotification,
    setLoading: SetLoading,
    setNewUserId: SetNewUserId,
    setNewPigeonId: SetNewPigeonId,
    setShowTagMenu: SetShowTagMenu
  ): WelcomeFormHandler {
    if (!WelcomeFormHandler.instance) {
      WelcomeFormHandler.instance = new WelcomeFormHandler(
        setNotification,
        setLoading,
        setNewPigeonId,
        setNewUserId,
        setShowTagMenu
      );
    }
    return WelcomeFormHandler.instance;
  }

  validateUserName(name: string): boolean {
    const userNameRegex = /^[a-zA-Z0-9 _-]+$/;
    if (name.length > 16) {
      this.setNotification({
        message: 'Username cannot be longer than 16 characters.',
        type: 'error',
      });
      return false;
    }
    if (!userNameRegex.test(name)) {
      this.setNotification({
        message: 'Only letters, numbers, space, hyphen, and underscore are allowed.',
        type: 'error',
      });
      return false;
    }
    return true;
  }

  validateBirthYear(birthYear: string): boolean {
    const yearNumber = Number(birthYear);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(yearNumber)) {
      this.setNotification({
        message: 'Birth year should be legit.',
        type: 'error',
      });
      return false;
    }
    if (yearNumber < currentYear - 99) {
      this.setNotification({
        message: `Nice try, but you can't be ${currentYear - yearNumber} years old!`,
        type: 'error',
      });
      return false;
    }
    if (yearNumber > currentYear - 13) {
      this.setNotification({
        message: 'You must be at least 13 years old to join the fun!',
        type: 'error',
      });
      return false;
    }
    return true;
  }

  validateBirthMonth(birthMonth: string): boolean {
    const monthNumber = Number(birthMonth);
    if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      this.setNotification({
        message: 'Birth month must be a legit.',
        type: 'error',
      });
      return false;
    }
    return true;
  }

  async createUser(
    _e: React.FormEvent<HTMLFormElement>,
    userName: string,
    birthYear: string,
    birthMonth: string,
    sex: string
  ): Promise<void> {
    let location: ILocation | null = null;
    try {
      location = await GeoLocationService.getLocation();
    } catch (error) {
      if ((error as IGeolocationPositionError).code !== undefined) {
        const geolocationError = error as IGeolocationPositionError;
        const isDenied = geolocationError.code === 1;
        this.setNotification({
          message: isDenied
            ? 'This is a geo network, we only fetch generic location.'
            : 'Enable location services so we assign you a pigeon.',
          type: 'error',
        });
        logDebug(`Geolocation error: ${isDenied ? 'Permission denied' : geolocationError.message}`);
        return;
      } else if (error instanceof Error) {
        this.setNotification({
          message: error.message,
          type: 'error',
        });
        logDebug(`Error: ${error.message}`);
        return;
      }
      this.setNotification({
        message: 'unknown geo error, we told the fox.',
        type: 'error',
      });
      logDebug('An unknown error occurred');
      posthog.capture('Geolocation Error', {
        error: 'unknown',
      });
      return;
    }

    this.setLoading(true);

    if (!this.validateBirthYear(birthYear) || !this.validateBirthMonth(birthMonth)) {
      this.setLoading(false);
      return;
    }

    try {
      const response = await apiService.post('/api/users/create', {
        userName,
        birthYear,
        birthMonth,
        sex,
        location: {
          lat: location.lat,
          lon: location.lon,
        },
      });

      posthog.capture('User Registered', {
        birthYear,
        birthMonth,
        sex,
        username: userName,
      });

      // Store Variables for the Tag Menu
      const { userId, pigeonId } = response.data;
      this.setNewUserId(userId);
      this.setNewPigeonId(pigeonId);
      this.setShowTagMenu(true); // Ensure this is called after setting the IDs

      // this.setNotification({
      //   message: 'A new pigeon has been assigned!',
      //   type: 'success',
      // });
    } catch (error) {
      this.setNotification({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
      logDebug(`Error creating user: ${error}`);
    } finally {
      this.setLoading(false);
    }
  }

  async handleUserRegistration(
    e: React.FormEvent<HTMLFormElement>,
    userName: string,
    birthYear: string,
    birthMonth: string,
    sex: string
  ): Promise<void> {
    e.preventDefault();

    // Skip reCAPTCHA in development
    if (process.env.REACT_APP_ENABLE_RECAPTCHA !== 'true') {
      this.createUser(e, userName, birthYear, birthMonth, sex);
      return;
    }

    const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      posthog.capture('Registration Failed: Recaptcha Key Missing', {
        reason: 'missing_recaptcha_key',
      });
      this.setNotification({
        message: 'Recaptcha site key is missing.',
        type: 'error',
      });
      posthog.capture('Recaptcha Key Missing', {
        reason: 'missing_recaptcha_key',
      });
      return;
    }

    if (this.isRecaptchaValidated) {
      this.createUser(e, userName, birthYear, birthMonth, sex);
      return;
    }

    try {
      const token = await this.handleReCaptcha.execute(siteKey);
      if (!token) {
        this.setNotification({
          message: 'Recaptcha token is missing.',
          type: 'error',
        });
        posthog.capture('Recaptcha Token Missing', {
          reason: 'missing_recaptcha_token',
        });
        return;
      }

      const isValidToken = await this.handleReCaptcha.validateTokenWithCache(token);
      if (!isValidToken) {
        this.setNotification({
          message: 'Our defense thinks you are a bot, try a different browser.',
          type: 'error',
        });
        posthog.capture('Recaptcha Validation Failed', {
          reason: 'recaptcha_validation_failed',
        });
        return;
      }

      this.isRecaptchaValidated = true;
      this.createUser(e, userName, birthYear, birthMonth, sex);
    } catch (error) {
      console.error('Recaptcha execution error:', error);
      posthog.capture('Recaptcha Execution Error', {
        reason: 'recaptcha_execution_error',
        error: (error as Error).message,
      });
      this.setNotification({
        message: 'Recaptcha error, please refresh try again.',
        type: 'error',
      });
    }
  }

  copyToClipboard(newPigeonId: string): void {
    navigator.clipboard.writeText(newPigeonId).then(
      () => {
        logDebug('User ID copied to clipboard');
        this.setNotification({
          message: 'Copied!',
          type: 'success',
        });
      },
      () => {
        this.setNotification({
          message: 'Copy failed.',
          type: 'error',
        });
        logDebug('Error copying User ID to clipboard');
      }
    );
  }

  handleLoginWithTag(newPigeonId: string, newUserId: string): void {
    setCookie(this.PIGEON_ID_COOKIE, newPigeonId, 365);
    setCookie(this.USER_ID_COOKIE, newUserId, 365);
    window.location.reload(); // Reload to display the home page
    logDebug('User logged in with tag');
  }

  async handleLogin(e: React.FormEvent<HTMLFormElement>, existingPigeonId: string): Promise<void> {
    e.preventDefault();
    if (!existingPigeonId.trim()) {
      this.setNotification({
        message: 'No tag? no pigeon!, enter a tag.',
        type: 'error',
      });
      logDebug('Existing User ID is required');
      return;
    }

    try {
      const response = await apiService.get(`/api/users/login/${existingPigeonId}`);
      if (response.data?.userId) {
        const existingUserId = response.data.userId;
        posthog.capture('User Login', {
          userId: existingUserId,
        });
        setCookie(this.PIGEON_ID_COOKIE, existingPigeonId, 365);
        setCookie(this.USER_ID_COOKIE, existingUserId, 365);
        window.location.reload();
        logDebug('Existing User ID found and set successfully');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        this.setNotification({
          message: 'Is this right? No pigeon has such tag.',
          type: 'error',
        });
        logDebug('User ID not found');
      } else {
        this.setNotification({
          message: 'Racoon says it is serious, reported to a fox.',
          type: 'error',
        });
        logDebug('Error fetching existing User ID');
        posthog.capture('User Login Failed', {
          error: axiosError.message,
        });
      }
    }
  }
}

export default WelcomeFormHandler;
