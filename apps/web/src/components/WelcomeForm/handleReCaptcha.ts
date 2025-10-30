import posthog from 'posthog-js';
import apiService from '../../services/apiService';

class HandleReCaptcha {
  private recaptchaCache: Map<string, boolean>;
  private grecaptcha: typeof window.grecaptcha;

  constructor() {
    this.grecaptcha = window.grecaptcha;
    this.recaptchaCache = new Map();
  }

  async execute(siteKey: string): Promise<string> {
    try {
      return await this.grecaptcha.execute(siteKey, { action: 'submit' });
    } catch (error) {
      console.error('Recaptcha execution error:', error);
      posthog.capture('Recaptcha Execution Error', {
        reason: 'recaptcha_execution_error',
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const isValid = await apiService.validateRecaptchaToken(token);
      if (!isValid) {
        const recaptchaError = 'Registration Failed: Blocked by Recaptcha';
        posthog.capture(recaptchaError, {
          reason: 'recaptcha_validation_failed',
        });
      }
      return isValid;
    } catch (_error) {
      const recaptchaError = 'Registration Failed: Recaptcha Error';
      posthog.capture(recaptchaError, {
        reason: 'recaptcha_error',
      });
      return false;
    }
  }

  async validateTokenWithCache(token: string): Promise<boolean> {
    const cachedResult = this.recaptchaCache.get(token);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    const isValid = await this.validateToken(token);
    this.recaptchaCache.set(token, isValid);
    return isValid;
  }
}

export default HandleReCaptcha;
