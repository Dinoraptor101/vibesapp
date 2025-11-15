import { Camera, Copy, Loader2, LogOut, MapPin } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getCookie } from '@/lib/api';
import { useAccountUpdates } from '../hooks/useAccountUpdates';

const MBTI_TYPES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];

export function AccountTab() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { queueUpdate } = useAccountUpdates();

  // Form state
  const [bio, setBio] = useState(user?.bio || '');
  const [mbti, setMbti] = useState(user?.mbtiPersonality || 'INFJ');
  const [zipCode, setZipCode] = useState('');
  const [locationStr, setLocationStr] = useState(
    user?.location ? `${user.location.city || ''}` : ''
  );
  const [polarity, setPolarity] = useState<'YIN' | 'YANG'>(
    (user?.polarity?.toUpperCase() as 'YIN' | 'YANG') || 'YANG'
  );

  // UI state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showGpsSpinner, setShowGpsSpinner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gpsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setMbti(user.mbtiPersonality || 'INFJ');
      setLocationStr(user.location?.city || '');
      setPolarity((user.polarity?.toUpperCase() as 'YIN' | 'YANG') || 'YANG');
    }
  }, [user]);

  // Bio handler with auto-save on blur
  const handleBioBlur = () => {
    if (bio.length > 200) {
      setBio(user?.bio || ''); // Silent revert
      console.log('Bio exceeds 200 characters, reverted');
      return;
    }
    if (bio !== user?.bio) {
      const previousBio = user?.bio || '';
      queueUpdate(
        { bio },
        {
          onError: (error) => {
            // ZEN: Silent revert on error, log to console only
            console.error('Failed to update bio:', error);
            setBio(previousBio);
          },
        }
      );
    }
  };

  // MBTI handler with auto-save
  const handleMbtiChange = (newMbti: string) => {
    const previousMbti = mbti;
    setMbti(newMbti);
    queueUpdate(
      { mbtiPersonality: newMbti },
      {
        onError: (error) => {
          // ZEN: Silent revert on error, log to console only
          console.error('Failed to update MBTI:', error);
          setMbti(previousMbti);
        },
      }
    );
  };

  // Zip code handler with auto-save on blur
  const handleZipCodeBlur = () => {
    if (zipCode?.trim()) {
      queueUpdate({ zipCode });
    }
  };

  // GPS button handler
  const handleGPSClick = () => {
    if (!navigator.geolocation) {
      console.error('GPS not supported on this device');
      return;
    }

    setGpsLoading(true);

    // Show spinner only if GPS takes > 1 second
    gpsTimeoutRef.current = setTimeout(() => {
      setShowGpsSpinner(true);
    }, 1000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Clear timeout and hide spinner
        if (gpsTimeoutRef.current) {
          clearTimeout(gpsTimeoutRef.current);
        }
        setGpsLoading(false);
        setShowGpsSpinner(false);

        const { latitude, longitude } = position.coords;

        // Geocode to get location string (simplified - would need geocoding API)
        const locStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocationStr(locStr);

        // Queue update
        queueUpdate({
          location: { lat: latitude, lon: longitude },
        });

        // ZEN: Silent success, no toast
        console.log('Location updated:', locStr);
      },
      (error) => {
        // Clear timeout and hide spinner
        if (gpsTimeoutRef.current) {
          clearTimeout(gpsTimeoutRef.current);
        }
        setGpsLoading(false);
        setShowGpsSpinner(false);

        // Silent fail - keep current value
        console.error('GPS error:', error);
      }
    );
  };

  // Polarity toggle handler
  const handlePolarityToggle = () => {
    const previousPolarity = polarity;
    const newPolarity = polarity === 'YIN' ? 'YANG' : 'YIN';
    setPolarity(newPolarity);
    queueUpdate(
      { polarity: newPolarity.toLowerCase() as 'yin' | 'yang' },
      {
        onError: (error) => {
          // ZEN: Silent revert on error, log to console only
          console.error('Failed to update polarity:', error);
          setPolarity(previousPolarity);
        },
      }
    );
  };

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type - must be an image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Image file too large - must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // TODO: Implement actual S3 upload with presigned URL
      // For now, skip avatar updates to avoid 413 Payload Too Large
      // Base64 encoding makes images too large for PATCH requests
      console.warn('Avatar upload disabled - implement S3 presigned URL upload');
      setUploadingAvatar(false);
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadingAvatar(false);
    }
  };

  // Copy Pigeon ID
  const handleCopyPigeonId = async () => {
    // SECURITY: Always get pigeonId from cookie, NEVER from API response
    // This prevents exposing Pigeon IDs through the backend API
    const pigeonId = getCookie('pigeonId');

    if (pigeonId) {
      try {
        await navigator.clipboard.writeText(pigeonId);
        // ZEN: Silent success, no toast (user sees it was copied)
        console.log('Pigeon ID copied to clipboard');
      } catch (error) {
        console.error('Failed to copy Pigeon ID:', error);
      }
    } else {
      console.error('Pigeon ID not found. Please log in again.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className="p-4 pb-8 space-y-6">
      {/* Profile Photo */}
      <div>
        <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
          Profile Photo
        </div>
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.profilePictureUrl}
            alt={user?.username || 'User'}
            size="xl"
            className="ring-2 ring-gray-200 dim:ring-gray-600 dark:ring-gray-700"
          />
          <Button
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
            variant="secondary"
            size="sm"
          >
            {uploadingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={handleBioBlur}
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          placeholder="Tell others about yourself..."
        />
        {bio.length >= 180 && (
          <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400 mt-1">
            {bio.length}/200 characters
          </p>
        )}
      </div>

      {/* MBTI Type */}
      <div>
        <label
          htmlFor="mbti"
          className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2"
        >
          MBTI Type
        </label>
        <select
          id="mbti"
          value={mbti}
          onChange={(e) => handleMbtiChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {MBTI_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Location (Zip Code) */}
      <div>
        <label
          htmlFor="zipCode"
          className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2"
        >
          Location (Zip Code)
        </label>
        <div className="flex gap-2">
          <input
            id="zipCode"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onBlur={handleZipCodeBlur}
            placeholder="60601"
            className="flex-1 px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <Button
            onClick={handleGPSClick}
            disabled={gpsLoading}
            variant="secondary"
            size="sm"
            aria-label="Use current location"
          >
            {showGpsSpinner ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        </div>
        {locationStr && (
          <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {locationStr}
          </p>
        )}
      </div>

      {/* Polarity */}
      <div>
        <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
          Polarity
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm font-semibold text-gray-700 dim:text-gray-200 dark:text-gray-300">
            YIN
          </span>
          <button
            type="button"
            onClick={handlePolarityToggle}
            className="relative inline-flex h-14 w-28 items-center rounded-full bg-gray-100 dim:bg-gray-700 dark:bg-gray-800 ring-2 ring-gray-300 dim:ring-gray-500 dark:ring-gray-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
            aria-label={`Current polarity: ${polarity}`}
          >
            <span
              className={`absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg shadow-lg transition-all duration-300 ease-in-out ${
                polarity === 'YANG'
                  ? 'translate-x-16 from-orange-400 to-red-500'
                  : 'translate-x-2 from-blue-400 to-purple-500'
              }`}
            >
              {polarity === 'YIN' ? '🌙' : '☀️'}
            </span>
          </button>
          <span className="text-sm font-semibold text-gray-700 dim:text-gray-200 dark:text-gray-300">
            YANG
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Security */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-3">
          Security
        </h3>
        <Button onClick={handleCopyPigeonId} variant="secondary" className="mb-3">
          <Copy className="w-4 h-4 mr-2" />
          Copy Pigeon ID
        </Button>
        <div className="p-3 bg-yellow-50 dim:bg-yellow-900/30 dark:bg-yellow-900/20 border border-yellow-200 dim:border-yellow-700/50 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dim:text-yellow-300 dark:text-yellow-200">
            <span className="font-medium">[!] Never Share!</span> Anyone with your Pigeon ID can
            pretend to be you.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Logout */}
      <div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
