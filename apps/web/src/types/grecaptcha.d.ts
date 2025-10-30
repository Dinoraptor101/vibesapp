import { ReCaptcha } from 'react-recaptcha-v3';

declare global {
  interface Window {
    grecaptcha: ReCaptcha;
  }
}
