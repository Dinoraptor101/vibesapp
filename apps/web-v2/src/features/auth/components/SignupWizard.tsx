import { Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea } from '@/components/ui-next';
import { useAuth } from '@/features/auth';
import { uploadImage } from '@/features/posts/api/s3Service';
import { compressImage } from '@/features/posts/utils/imageUtils';
import { deleteCookie } from '@/lib';
import { authApi } from '../services/authApi';
import { generatePigeonId } from '../utils/pigeonIdGenerator';
import { LocationStep } from './LocationStep';
import { MBTISelector } from './MBTISelector';

interface SignupData {
  pigeonId: string;
  userName: string;
  mbtiPersonality: string;
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
  { id: 5, title: 'Location', required: true },
  { id: 6, title: 'Avatar', required: false },
  { id: 7, title: 'About You', required: false },
];

export function SignupWizard() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear any existing auth data when starting signup
  useEffect(() => {
    // Clear cookies without triggering navigation
    deleteCookie('pigeonId');
    deleteCookie('userId');
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedPigeonId, setCopiedPigeonId] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [signupData, setSignupData] = useState<SignupData>({
    pigeonId: '',
    userName: '',
    mbtiPersonality: '',
    location: null,
    bio: '',
    birthYear: new Date().getFullYear() - 20, // Default to 20 years old
    birthMonth: 1,
    sex: 'Other',
  });

  const handleGeneratePigeonId = () => {
    const newPigeonId = generatePigeonId();
    setSignupData((prev) => ({ ...prev, pigeonId: newPigeonId }));
    setCurrentStep(2); // Move to step 2 to show the generated ID
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
    if (currentStep === 3 && !signupData.userName.trim()) {
      setError('Username is required');
      return;
    }
    if (currentStep === 4 && !signupData.mbtiPersonality) {
      setError('Please select your MBTI type');
      return;
    }
    if (currentStep === 5 && !signupData.location) {
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
      const cloudFrontUrl = `https://d1pegm4swremw5.cloudfront.net/${imageKey}`;

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
      // Validate required fields
      if (
        !signupData.pigeonId ||
        !signupData.userName ||
        !signupData.mbtiPersonality ||
        !signupData.location
      ) {
        throw new Error('Missing required fields');
      }

      // Call backend API to create user
      const { pigeonId } = await authApi.signup({
        pigeonId: signupData.pigeonId, // Send the frontend-generated Pigeon ID
        userName: signupData.userName,
        birthYear: signupData.birthYear,
        birthMonth: signupData.birthMonth,
        sex: signupData.sex.toLowerCase() as 'male' | 'female' | 'other',
        location: {
          lat: signupData.location.lat,
          lon: signupData.location.lon,
        },
        mbtiPersonality: signupData.mbtiPersonality,
        profilePictureUrl: signupData.profilePictureUrl,
        bio: signupData.bio || undefined,
      });

      // Auto-login with the generated Pigeon ID
      await login(pigeonId);

      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-text-primary">Welcome to VibesApp</h2>
              <p className="text-lg text-text-secondary">
                A picture-based social network where you connect through vibes, not followers
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-6 text-left">
              <h3 className="font-semibold text-text-primary">What makes VibesApp unique?</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  🔐 <strong>Password-only login</strong> - No email, no username required to sign
                  in
                </li>
                <li>
                  🎭 <strong>MBTI-based connections</strong> - Match with personalities that vibe
                  with you
                </li>
                <li>
                  📍 <strong>Location-aware</strong> - Discover nearby vibes and local content
                </li>
                <li>
                  ❤️ <strong>Vibes system</strong> - Like posts and build your karma
                </li>
              </ul>
            </div>

            <Button onClick={handleGeneratePigeonId} size="lg" className="w-full">
              Get Started
            </Button>

            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-brand-purple hover:underline"
              >
                Login
              </button>
            </p>
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
              <div className="mb-4 flex items-center justify-between rounded-md bg-surface p-4 font-mono text-lg">
                <span className="font-bold text-text-primary">{signupData.pigeonId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPigeonId}
                  leftIcon={<Copy className="h-4 w-4" />}
                >
                  {copiedPigeonId ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-semibold text-warning-text">⚠️ Important:</p>
                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  <li>This acts as your password across all devices</li>
                  <li>There's no way to recover it if lost</li>
                  <li>Write it down or save it in a password manager</li>
                  <li>Never share it with anyone</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleGeneratePigeonId} className="flex-1">
                Generate New ID
              </Button>
              <Button onClick={handleNext} className="flex-1">
                I've Saved It
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Choose a Username</h2>
              <p className="text-text-secondary">This is how others will see you on VibesApp</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Username"
                value={signupData.userName}
                onChange={(e) => setSignupData((prev) => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter username"
                required
                helperText="3-20 characters, letters and numbers only"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-text-primary">What's Your MBTI Type?</h2>
              <p className="text-text-secondary">
                This helps us connect you with compatible personalities
              </p>
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
              <h2 className="text-2xl font-bold text-text-primary">Where Are You?</h2>
              <p className="text-text-secondary">Help us show you nearby vibes and local content</p>
            </div>

            <LocationStep
              location={signupData.location}
              onLocationChange={(location: { lat: number; lon: number } | null) =>
                setSignupData((prev) => ({ ...prev, location }))
              }
            />
          </div>
        );

      case 6:
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

      case 7:
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
