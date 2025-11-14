import { Check, Copy, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { uploadImage } from '@/features/posts/api/s3Service';
import { compressImage } from '@/features/posts/utils/imageUtils';
import { deleteCookie, setCookie } from '@/lib';
import { authApi } from '../services/authApi';
import { LocationStep } from './LocationStep';
import { MBTISelector } from './MBTISelector';
import './LoginForm.css'; // Import shake animation

interface SignupData {
  pigeonId: string;
  userName: string;
  mbtiPersonality: string;
  polarity: 'yin' | 'yang';
  location: { lat: number; lon: number } | null;
  profilePictureUrl?: string;
  bio?: string;
  birthYear: number;
  birthMonth: number;
  sex: 'Male' | 'Female' | 'Other';
}

const STEPS = [
  { id: 1, title: 'Welcome', required: true },
  { id: 2, title: 'Your Pigeon ID', required: true },
  { id: 3, title: 'Username', required: true },
  { id: 4, title: 'MBTI Type', required: true },
  { id: 5, title: 'Polarity', required: true },
  { id: 6, title: 'Location', required: true },
  { id: 7, title: 'Avatar', required: false },
  { id: 8, title: 'About You', required: false },
];

export function SignupWizard() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    bio: '',
    birthYear: new Date().getFullYear() - 20, // Default to 20 years old
    birthMonth: 1,
    sex: 'Other',
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

    if (currentStep === 4 && !signupData.mbtiPersonality) {
      setError('Please select your MBTI type');
      return;
    }
    // Step 5 is polarity - no validation needed (has default)
    if (currentStep === 6 && !signupData.location) {
      setError('Location is required');
      return;
    }

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

  const handleSkip = () => {
    setError('');
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
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

      // Call backend API to create user
      console.log('Signup data being sent:', {
        pigeonId: signupData.pigeonId,
        userName: signupData.userName,
        birthYear: signupData.birthYear,
        birthMonth: signupData.birthMonth,
        sex: signupData.sex.toLowerCase(),
        location: signupData.location,
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
        },
        polarity: signupData.polarity,
        mbtiPersonality: signupData.mbtiPersonality,
        profilePictureUrl: signupData.profilePictureUrl,
        bio: signupData.bio || undefined,
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
              className="text-6xl mb-2 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Return to login"
            >
              🕊️
            </button>

            <div className="space-y-2">
              <p className="text-lg text-text-secondary">
                A picture-based social network where you connect through vibes, not followers
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-6 text-left">
              <h3 className="font-semibold text-text-primary">What makes us unique?</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  🔐 <strong>Single ID login</strong> - No emails, no passwords
                </li>
                <li>
                  🎭 <strong>Yin/Yang & MBTI connections</strong> - Match with personalities that
                  vibe with you
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

            <div className="rounded-lg border-2 border-brand-purple bg-brand-purple/5 p-6">
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
                <div className="flex flex-1 items-center justify-between rounded-md bg-surface p-4 font-mono text-lg">
                  <span className="font-bold text-text-primary">{signupData.pigeonId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPigeonId}
                    className="shrink-0"
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

      case 4:
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

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Choose Your Polarity</h2>
              <p className="text-text-secondary">
                Are you more Yin (receptive, calm) or Yang (active, dynamic)?
              </p>
            </div>

            <div className="space-y-6 rounded-lg border border-border bg-surface-elevated p-6">
              <div className="flex items-center justify-center gap-4">
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

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 rounded-lg bg-surface p-4">
                  <p className="font-semibold text-brand-purple">🌙 YIN</p>
                  <ul className="list-inside list-disc space-y-1 text-text-secondary">
                    <li>Receptive</li>
                    <li>Reflective</li>
                    <li>Calm energy</li>
                    <li>Intuitive</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-lg bg-surface p-4">
                  <p className="font-semibold text-orange-500">☀️ YANG</p>
                  <ul className="list-inside list-disc space-y-1 text-text-secondary">
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

      case 6:
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
              onAutoSuccess={() => {
                // Auto-advance to step 7 when GPS succeeds
                setCurrentStep(7);
              }}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Add a Profile Picture</h2>
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

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Tell Us About Yourself</h2>
              <p className="text-text-secondary">Optional - share a bit about who you are</p>
            </div>

            <Textarea
              label="Bio"
              value={signupData.bio}
              onChange={(e) => setSignupData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="What's your vibe? What do you love? What makes you unique?"
              rows={5}
              maxLength={500}
              helperText="Max 500 characters"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
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
      <div className="rounded-lg border border-border bg-surface p-8">{renderStepContent()}</div>

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

          {!STEPS[currentStep - 1]?.required && currentStep < STEPS.length && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="ml-auto"
            >
              Skip
            </Button>
          )}

          {currentStep < STEPS.length && currentStep > 1 && (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className={!STEPS[currentStep - 1]?.required ? '' : 'ml-auto'}
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
