import { Check, Copy, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Logo, Textarea } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { uploadImage } from '@/features/posts/api/s3Service';
import { compressImage } from '@/features/posts/utils/imageUtils';
import { deleteCookie, setCookie } from '@/lib';
import { authApi } from '../services/authApi';
import { LocationStep } from './LocationStep';
import { MBTISelector } from './MBTISelector';
import './LoginForm.css'; // Import shake animation

const RECAPTCHA_ENABLED = import.meta.env.VITE_ENABLE_RECAPTCHA === 'true';

interface SignupData {
  pigeonId: string;
  userName: string;
  mbtiPersonality: string;
  polarity: 'yin' | 'yang';
  location: { lat: number; lon: number } | null;
  city: string;
  state: string;
  profilePictureUrl?: string;
  bio?: string;
  birthYear: number;
  birthMonth: number;
  sex: 'Male' | 'Female' | '';
}

const STEPS = [
  { id: 1, title: 'Welcome', required: true },
  { id: 2, title: 'Your Pigeon ID', required: true },
  { id: 3, title: 'Username', required: true },
  { id: 4, title: 'Your Age', required: true },
  { id: 5, title: 'Biological Sex', required: true },
  { id: 6, title: 'MBTI Type', required: true },
  { id: 7, title: 'Polarity', required: true },
  { id: 8, title: 'Location', required: true },
  { id: 9, title: 'Avatar', required: false },
  { id: 10, title: 'About You', required: false },
];

// MBTI type nicknames for bio generation
const MBTI_NICKNAMES: Record<string, string> = {
  INTJ: 'Architect',
  INTP: 'Logician',
  ENTJ: 'Commander',
  ENTP: 'Debater',
  INFJ: 'Advocate',
  INFP: 'Mediator',
  ENFJ: 'Protagonist',
  ENFP: 'Campaigner',
  ISTJ: 'Logistician',
  ISFJ: 'Defender',
  ESTJ: 'Executive',
  ESFJ: 'Consul',
  ISTP: 'Virtuoso',
  ISFP: 'Adventurer',
  ESTP: 'Entrepreneur',
  ESFP: 'Entertainer',
};

// Polarity descriptors for bio generation (grammatically smooth)
const YIN_DESCRIPTORS = ['a reflective', 'an intuitive', 'a thoughtful', 'a calm'];
const YANG_DESCRIPTORS = ['an expressive', 'a dynamic', 'an energetic', 'an assertive'];

// Month names for birth date selector
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Generate year options (13 to 100 years old)
const currentYear = new Date().getFullYear();
const MIN_AGE = 13;
const MAX_AGE = 100;
const YEARS = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => currentYear - MIN_AGE - i);

export function SignupWizard() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // reCAPTCHA verification helper
  const handleRecaptchaVerify = useCallback(async () => {
    if (!RECAPTCHA_ENABLED || !executeRecaptcha) {
      return undefined;
    }
    try {
      const token = await executeRecaptcha('signup');
      return token;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return undefined;
    }
  }, [executeRecaptcha]);

  // Clear any existing auth data when starting signup
  useEffect(() => {
    // Clear ALL auth cookies without triggering navigation
    console.log('Clearing all auth cookies for fresh signup...');
    deleteCookie('pigeonId');
    deleteCookie('userId');
    deleteCookie('token');
    deleteCookie('session');

    // Clear any auth data from localStorage/sessionStorage
    localStorage.removeItem('user');
    sessionStorage.clear();

    console.log('Auth cookies cleared');
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPigeonId, setIsGeneratingPigeonId] = useState(false);
  const [showGeneratingSpinner, setShowGeneratingSpinner] = useState(false);
  const [error, setError] = useState('');
  const [copiedPigeonId, setCopiedPigeonId] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);

  const generatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [signupData, setSignupData] = useState<SignupData>({
    pigeonId: '',
    userName: '',
    mbtiPersonality: '',
    polarity: 'yang', // Default to yang
    location: null,
    city: '',
    state: '',
    bio: '',
    birthYear: 0, // User must select
    birthMonth: 0, // User must select
    sex: '',
  });

  const handleGeneratePigeonId = async () => {
    setIsGeneratingPigeonId(true);
    setError('');

    // ZEN: Only show spinner if generation takes > 1 second
    generatingTimeoutRef.current = setTimeout(() => {
      setShowGeneratingSpinner(true);
    }, 1000);

    try {
      // Call backend to generate a unique Pigeon ID
      const newPigeonId = await authApi.generatePigeonId();

      // Clear timeout and hide spinner
      if (generatingTimeoutRef.current) {
        clearTimeout(generatingTimeoutRef.current);
      }
      setShowGeneratingSpinner(false);

      setSignupData((prev) => ({ ...prev, pigeonId: newPigeonId }));
      setCurrentStep(2); // Move to step 2 to show the generated ID
    } catch (err) {
      // Clear timeout and hide spinner
      if (generatingTimeoutRef.current) {
        clearTimeout(generatingTimeoutRef.current);
      }
      setShowGeneratingSpinner(false);

      console.error('Error generating Pigeon ID:', err);
      setError('Failed to generate Pigeon ID. Please try again.');
    } finally {
      setIsGeneratingPigeonId(false);
    }
  };

  const handleCopyPigeonId = async () => {
    if (signupData.pigeonId) {
      await navigator.clipboard.writeText(signupData.pigeonId);
      setCopiedPigeonId(true);
      setTimeout(() => setCopiedPigeonId(false), 2000);
    }
  };

  const handleNext = () => {
    setError('');

    // Validation for required steps
    if (currentStep === 3) {
      const username = signupData.userName.trim();

      // Check if username is empty
      if (!username) {
        setShowUsernameError(true);
        setSignupData((prev) => ({ ...prev, userName: '' }));
        setTimeout(() => setShowUsernameError(false), 500);
        return;
      }

      // Check length (3-20 characters)
      if (username.length < 3 || username.length > 20) {
        setShowUsernameError(true);
        setTimeout(() => setShowUsernameError(false), 500);
        return;
      }

      // Check if only letters and numbers (alphanumeric)
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(username)) {
        setShowUsernameError(true);
        setTimeout(() => setShowUsernameError(false), 500);
        return;
      }
    }

    // Step 4 Birth Date - validation handled by disabled button
    // Step 5 MBTI - validation handled by disabled button
    // Step 6 is polarity - no validation needed (has default)
    // Step 7 location - validation handled by disabled button

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to check if username is valid
  const isUsernameValid = (username: string): boolean => {
    if (!username || username.length < 3 || username.length > 20) {
      return false;
    }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(username);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setError('');

    try {
      // Compress image
      const compressedBlob = await compressImage(file);

      // Upload to S3
      const imageKey = await uploadImage(compressedBlob);

      // Construct CloudFront URL (using the CDN URL from backend)
      const CDN_URL = import.meta.env.VITE_CDN_URL;

      if (!CDN_URL) {
        throw new Error('VITE_CDN_URL environment variable is required');
      }

      const cloudFrontUrl = `${CDN_URL}/${imageKey}`;

      // Update signup data with profile picture URL
      setSignupData((prev) => ({ ...prev, profilePictureUrl: cloudFrontUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      // Clear all auth cookies one more time before signup
      console.log('Clearing cookies before signup submission...');
      deleteCookie('pigeonId');
      deleteCookie('userId');
      deleteCookie('token');
      deleteCookie('session');

      // Validate required fields before submission
      if (!signupData.pigeonId) {
        throw new Error('Pigeon ID is required');
      }
      if (!signupData.userName.trim()) {
        throw new Error('Username is required');
      }
      if (!signupData.mbtiPersonality) {
        throw new Error('MBTI type is required');
      }
      if (!signupData.polarity) {
        throw new Error('Polarity is required');
      }
      if (!signupData.location) {
        throw new Error('Location is required');
      }

      // Get reCAPTCHA token if enabled
      const recaptchaToken = await handleRecaptchaVerify();

      // Call backend API to create user
      console.log('Signup data being sent:', {
        pigeonId: signupData.pigeonId,
        userName: signupData.userName,
        birthYear: signupData.birthYear,
        birthMonth: signupData.birthMonth,
        sex: signupData.sex.toLowerCase(),
        location: signupData.location,
        city: signupData.city,
        state: signupData.state,
        polarity: signupData.polarity,
        mbtiPersonality: signupData.mbtiPersonality,
        profilePictureUrl: signupData.profilePictureUrl,
        bio: signupData.bio,
      });

      // Store Pigeon ID in cookie before signup (for security - backend doesn't return it)
      setCookie('pigeonId', signupData.pigeonId, 365); // Store for 1 year
      console.log('Stored Pigeon ID in cookie:', signupData.pigeonId);

      await authApi.signup({
        pigeonId: signupData.pigeonId, // Send the frontend-generated Pigeon ID
        userName: signupData.userName,
        birthYear: signupData.birthYear,
        birthMonth: signupData.birthMonth,
        sex: signupData.sex.toLowerCase() as 'male' | 'female' | 'other',
        location: {
          lat: signupData.location.lat,
          lon: signupData.location.lon,
          city: signupData.city || undefined,
          state: signupData.state || undefined,
        },
        polarity: signupData.polarity,
        mbtiPersonality: signupData.mbtiPersonality,
        profilePictureUrl: signupData.profilePictureUrl,
        bio: signupData.bio || undefined,
        recaptchaToken, // Include reCAPTCHA token
      });

      console.log('Signup successful, using Pigeon ID from cookie for login');

      // Auto-login with the Pigeon ID (now stored in cookie)
      await login(signupData.pigeonId);

      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);

      // Handle duplicate Pigeon ID error
      if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
        setError('This Pigeon ID already exists. Please go back and generate a new one.');
        setCurrentStep(2); // Go back to Pigeon ID step
      } else {
        setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="block mx-auto hover:opacity-80 transition-opacity cursor-pointer mb-2"
              aria-label="Return to login"
            >
              <Logo size="xl" className="text-text-primary" />
            </button>

            <div className="space-y-2">
              <p className="text-lg text-text-secondary">
                A picture-based social network where you connect through vibes, not followers
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4 sm:p-6 text-left">
              <h3 className="font-semibold text-text-primary">What makes us unique?</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  🔐 <strong>Single ID login</strong> - No emails, no passwords
                </li>
                <li>
                  🎭 <strong>Yin/Yang & MBTI</strong> - Match with personalities that vibe with you
                </li>
                <li>
                  📍 <strong>Location-aware</strong> - Discover nearby posts and local content
                </li>
                <li>
                  ❤️ <strong>Vibes system</strong> - Engage and build your karma
                </li>
              </ul>
            </div>

            <Button
              onClick={handleGeneratePigeonId}
              size="lg"
              className="w-full"
              loading={showGeneratingSpinner}
              disabled={isGeneratingPigeonId}
            >
              {showGeneratingSpinner ? 'Generating...' : 'Get Started'}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Pigeon ID</h2>
              <p className="text-text-secondary">
                This is your unique password. Save it somewhere safe!
              </p>
            </div>

            <div className="rounded-lg border-2 border-brand-purple bg-brand-purple/5 p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGeneratePigeonId}
                  className="shrink-0"
                  title="Generate new ID"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div className="flex flex-1 items-center justify-between rounded-md bg-surface p-3 sm:p-4 font-mono text-base sm:text-lg">
                  <span className="font-bold text-text-primary break-all">
                    {signupData.pigeonId}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPigeonId}
                    className="shrink-0 ml-2"
                  >
                    {copiedPigeonId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-semibold text-warning-text">⚠️ Important:</p>
                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  <li>This acts as your password across all devices</li>
                  <li>There's no way to recover it if lost</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Username</h2>
              <p className="text-text-secondary">Your public identity</p>
            </div>

            <div className="space-y-4">
              <Input
                value={signupData.userName}
                onChange={(e) => setSignupData((prev) => ({ ...prev, userName: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNext();
                  }
                }}
                placeholder="cool_username"
                required
                helperText="3-20 characters, letters and numbers only"
                className={showUsernameError ? 'animate-shake' : ''}
              />
            </div>
          </div>
        );

      case 4: {
        // Calculate age for preview
        const calculateAge = () => {
          if (!signupData.birthYear || !signupData.birthMonth) return null;
          const today = new Date();
          const birthDate = new Date(signupData.birthYear, signupData.birthMonth - 1);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0) age--;
          return age;
        };
        const previewAge = calculateAge();

        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Age</h2>
              <p className="text-text-secondary">We use this to show your age on your profile</p>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4 sm:p-6">
              {/* Year Selector (first) */}
              <div className="space-y-2">
                <select
                  id="birth-year"
                  value={signupData.birthYear || ''}
                  onChange={(e) =>
                    setSignupData((prev) => ({
                      ...prev,
                      birthYear: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector (second) */}
              <div className="space-y-2">
                <select
                  id="birth-month"
                  value={signupData.birthMonth || ''}
                  onChange={(e) =>
                    setSignupData((prev) => ({
                      ...prev,
                      birthMonth: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                >
                  <option value="" disabled>
                    Month
                  </option>
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Preview */}
              {previewAge !== null && (
                <p className="text-center text-lg font-medium text-text-primary">
                  You are {previewAge} years old
                </p>
              )}

              <p className="text-center text-xs text-text-secondary">
                We only use this to calculate your age, so you don't have to update it manually.
              </p>
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Biological Sex</h2>
              <p className="text-text-secondary">
                You'd want to know this about others. They want to know it about you.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setSignupData((prev) => ({ ...prev, sex: 'Male' }))}
                className={`flex-1 max-w-[160px] py-4 px-6 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                  signupData.sex === 'Male'
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                    : 'border-border bg-surface text-text-primary hover:border-brand-purple/50'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setSignupData((prev) => ({ ...prev, sex: 'Female' }))}
                className={`flex-1 max-w-[160px] py-4 px-6 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                  signupData.sex === 'Female'
                    ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                    : 'border-border bg-surface text-text-primary hover:border-brand-purple/50'
                }`}
              >
                Female
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your MBTI Personality</h2>
              <p className="text-text-secondary">Help others understand how you think</p>
            </div>

            <MBTISelector
              value={signupData.mbtiPersonality}
              onChange={(mbti: string) =>
                setSignupData((prev) => ({ ...prev, mbtiPersonality: mbti }))
              }
            />

            <p className="text-center text-sm text-text-secondary">
              Don't know your type?{' '}
              <a
                href="https://www.16personalities.com/free-personality-test"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-purple hover:underline"
              >
                Take the test
              </a>
            </p>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Polarity</h2>
              <p className="text-text-secondary">
                Are you more Yin (receptive, calm) or Yang (active, dynamic)?
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 rounded-lg border border-border bg-surface-elevated p-4 sm:p-6">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <span className="text-sm font-semibold text-text-primary">YIN</span>
                <button
                  type="button"
                  onClick={() =>
                    setSignupData((prev) => ({
                      ...prev,
                      polarity: prev.polarity === 'yin' ? 'yang' : 'yin',
                    }))
                  }
                  className="relative inline-flex h-14 w-28 items-center rounded-full bg-surface ring-2 ring-border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
                  aria-label={`Current polarity: ${signupData.polarity.toUpperCase()}`}
                >
                  <span
                    className={`absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg shadow-lg transition-all duration-300 ease-in-out ${
                      signupData.polarity === 'yang'
                        ? 'translate-x-16 from-orange-400 to-red-500'
                        : 'translate-x-2 from-blue-400 to-purple-500'
                    }`}
                  >
                    {signupData.polarity === 'yin' ? '🌙' : '☀️'}
                  </span>
                </button>
                <span className="text-sm font-semibold text-text-primary">YANG</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="space-y-2 rounded-lg bg-surface p-3 sm:p-4">
                  <p className="font-semibold text-brand-purple">🌙 YIN</p>
                  <ul className="list-inside list-disc space-y-1 text-text-secondary text-xs sm:text-sm">
                    <li>Receptive</li>
                    <li>Reflective</li>
                    <li>Calm energy</li>
                    <li>Intuitive</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-lg bg-surface p-3 sm:p-4">
                  <p className="font-semibold text-orange-500">☀️ YANG</p>
                  <ul className="list-inside list-disc space-y-1 text-text-secondary text-xs sm:text-sm">
                    <li>Active</li>
                    <li>Expressive</li>
                    <li>Dynamic energy</li>
                    <li>Assertive</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-xs text-text-secondary">
                You can change this anytime in your settings
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Where Are You?</h2>
              <p className="text-text-secondary">Help us show you nearby vibes and local content</p>
            </div>

            <LocationStep
              location={signupData.location}
              onLocationChange={(location: { lat: number; lon: number } | null) =>
                setSignupData((prev) => ({ ...prev, location }))
              }
              onCityStateChange={(city: string, state: string) =>
                setSignupData((prev) => ({ ...prev, city, state }))
              }
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Your Picture</h2>
              <p className="text-text-secondary">
                Optional - you can add this later from your profile
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-elevated">
                {signupData.profilePictureUrl ? (
                  <img
                    src={signupData.profilePictureUrl}
                    alt="Profile preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                loading={isUploadingImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
              </Button>

              <p className="text-sm text-text-secondary">JPG, PNG or WebP • Max 5MB</p>
            </div>
          </div>
        );

      case 10: {
        // Generate bio summary
        const generateBioSummary = () => {
          const mbti = signupData.mbtiPersonality;
          const mbtiNickname = MBTI_NICKNAMES[mbti as keyof typeof MBTI_NICKNAMES] || mbti;
          
          const descriptors = signupData.polarity === 'yin' ? YIN_DESCRIPTORS : YANG_DESCRIPTORS;
          const polarityDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
          
          // Calculate age
          let age = '';
          if (signupData.birthYear && signupData.birthMonth) {
            const today = new Date();
            const birthDate = new Date(signupData.birthYear, signupData.birthMonth - 1);
            let years = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0) years--;
            age = `${years} years old`;
          }
          
          const sex = signupData.sex ? signupData.sex.toLowerCase() : '';
          const location = signupData.city && signupData.state 
            ? `from ${signupData.city}, ${signupData.state}` 
            : '';
          
          return `I'm a ${polarityDescriptor} ${mbtiNickname}${age ? `, ${age}` : ''}${sex ? `, ${sex}` : ''}${location ? `, ${location}` : ''}. Nice to meet you!`;
        };
        
        // Auto-generate bio on first render of this step if bio is empty
        const suggestedBio = generateBioSummary();
        if (!signupData.bio) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            setSignupData((prev) => {
              if (!prev.bio) {
                return { ...prev, bio: suggestedBio };
              }
              return prev;
            });
          }, 0);
        }

        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">About You</h2>
              <p className="text-text-secondary">We've written a summary for you. Feel free to edit it!</p>
            </div>

            <Textarea
              label="Bio"
              value={signupData.bio}
              onChange={(e) => setSignupData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Your bio will appear here..."
              rows={5}
              maxLength={500}
              helperText="Max 500 characters"
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:space-y-8 sm:p-6">
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-text-secondary">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="font-medium text-text-secondary">
            {STEPS[currentStep - 1]?.title}
            {!STEPS[currentStep - 1]?.required && ' (Optional)'}
          </span>
        </div>

        <div className="flex gap-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step.id < currentStep
                  ? 'bg-brand-purple'
                  : step.id === currentStep
                    ? 'bg-brand-purple/50'
                    : 'bg-surface-elevated'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-8">
        {renderStepContent()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-error-border bg-error-bg p-4 text-sm text-error-text">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep > 1 && (
        <div className="flex gap-3">
          {currentStep > 2 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}

          {currentStep < STEPS.length && currentStep > 1 && (
            <Button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentStep === 3 && !isUsernameValid(signupData.userName)) ||
                (currentStep === 4 && (!signupData.birthMonth || !signupData.birthYear)) ||
                (currentStep === 5 && !signupData.sex) ||
                (currentStep === 6 && !signupData.mbtiPersonality) ||
                (currentStep === 8 && !signupData.location)
              }
              className="ml-auto"
            >
              Next
            </Button>
          )}

          {currentStep === STEPS.length && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Signup'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
