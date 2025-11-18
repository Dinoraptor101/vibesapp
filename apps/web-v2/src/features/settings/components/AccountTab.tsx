import { Camera, Copy, Loader2, LogOut, MapPin } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/useAuth';
import { uploadImage } from '@/features/posts/api/s3Service';
import { compressImage } from '@/features/posts/utils/imageUtils';
import { useLocationGPS } from '@/hooks/useLocationGPS';
import { getCookie } from '@/lib/api';
import { getAvatarUrl } from '@/lib/avatarUtils';
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
  const { isGettingLocation, getGPSLocation } = useLocationGPS();

  // Form state (editable)
  const [bio, setBio] = useState(user?.bio || '');
  const [mbti, setMbti] = useState(user?.mbtiPersonality || 'INFJ');
  const [locationCity, setLocationCity] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [polarity, setPolarity] = useState<'YIN' | 'YANG'>(
    (user?.polarity?.toUpperCase() as 'YIN' | 'YANG') || 'YANG'
  );

  // Original values for change detection
  const [originalBio, setOriginalBio] = useState(user?.bio || '');
  const [originalMbti, setOriginalMbti] = useState(user?.mbtiPersonality || 'INFJ');
  const [originalLocationDisplay, setOriginalLocationDisplay] = useState('');

  // UI state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      const userBio = user.bio || '';
      const userMbti = user.mbtiPersonality || 'INFJ';
      const userPolarity = (user.polarity?.toUpperCase() as 'YIN' | 'YANG') || 'YANG';

      setBio(userBio);
      setMbti(userMbti);
      setPolarity(userPolarity);
      setOriginalBio(userBio);
      setOriginalMbti(userMbti);

      // Initialize location display (city only for now until backend supports state/country)
      if (user.location) {
        const display = user.location.city || '';
        console.log('Initializing location from user data:', {
          city: user.location.city,
          lat: user.location.latitude,
          lon: user.location.longitude,
        });

        setLocationCity(display); // Initialize the input field
        setOriginalLocationDisplay(display);
        setLocationCoords(
          user.location.latitude && user.location.longitude
            ? {
                lat: user.location.latitude,
                lon: user.location.longitude,
              }
            : null
        );
      } else {
        console.log('No user location data available');
      }
    }
  }, [user]);

  // Check if any field has changed
  const hasChanges =
    bio !== originalBio || mbti !== originalMbti || locationCity !== originalLocationDisplay;

  // Save handler
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      const updates: {
        bio?: string;
        mbtiPersonality?: string;
        location?: { lat: number; lon: number; city?: string; state?: string; country?: string };
      } = {};

      if (bio !== originalBio) {
        updates.bio = bio;
      }

      if (mbti !== originalMbti) {
        updates.mbtiPersonality = mbti;
      }

      if (locationCity !== originalLocationDisplay) {
        // Need to geocode if we don't have coordinates
        if (!locationCoords && locationCity.trim()) {
          try {
            const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
            if (GEOCODING_URL) {
              const response = await fetch(
                `${GEOCODING_URL}?q=${encodeURIComponent(locationCity)}&format=json&limit=1`
              );
              if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                  const result = data[0];
                  const lat = parseFloat(result.lat);
                  const lon = parseFloat(result.lon);
                  updates.location = {
                    lat,
                    lon,
                    city: locationCity || undefined,
                  };
                  setLocationCoords({ lat, lon });
                  console.log('Geocoded and added location:', updates.location);
                } else {
                  console.warn('No geocoding results found for:', locationCity);
                }
              }
            }
          } catch (error) {
            console.error('Error geocoding city:', error);
          }
        } else if (locationCoords && locationCity.trim()) {
          // We have coordinates, update with new city name
          updates.location = {
            ...locationCoords,
            city: locationCity,
          };
          console.log('Updated location with existing coords:', updates.location);
        } else if (!locationCity.trim() && locationCoords) {
          // City was cleared, just send coords
          updates.location = {
            ...locationCoords,
            city: undefined,
          };
          console.log('Cleared city, keeping coords:', updates.location);
        }
      }

      console.log('Sending updates:', updates);
      // Send updates
      await queueUpdate(updates);

      // Update original values
      setOriginalBio(bio);
      setOriginalMbti(mbti);
      setOriginalLocationDisplay(locationCity);

      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // GPS handler
  const handleGPSClick = async () => {
    const result = await getGPSLocation();
    if (result) {
      setLocationCoords({ lat: result.lat, lon: result.lon });
      setLocationCity(result.city);
      console.log('GPS location fetched:', result.city);
    }
  };

  // Handle manual city input
  const handleCityInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationCity.trim()) {
      e.preventDefault();

      try {
        const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
        if (!GEOCODING_URL) {
          throw new Error('VITE_GEOCODING_URL environment variable is required');
        }

        const response = await fetch(
          `${GEOCODING_URL}?q=${encodeURIComponent(locationCity)}&format=json&limit=1`
        );

        if (!response.ok) {
          throw new Error('Failed to geocode location');
        }

        const data = await response.json();

        if (data.length === 0) {
          console.error('Location not found');
          return;
        }

        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        setLocationCoords({ lat, lon });

        // Set display location from geocoding result (city only for now)
        const address = result.address || {};
        const city =
          address.city || address.town || address.village || address.municipality || result.name;
        const display = city || result.display_name;
        setLocationCity(display);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
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
      // Compress image (800x800 for avatar)
      const compressedBlob = await compressImage(file, 800, 800, 0.85);

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(compressedBlob);

      // Upload to S3
      const imageKey = await uploadImage(compressedBlob);

      // Construct full CDN URL
      const CDN_URL = import.meta.env.VITE_CDN_URL;
      if (!CDN_URL) {
        throw new Error('VITE_CDN_URL environment variable is required');
      }
      const fullAvatarUrl = imageKey.startsWith('http') ? imageKey : `${CDN_URL}/${imageKey}`;

      // Update profile with new avatar URL
      queueUpdate(
        { avatar: fullAvatarUrl },
        {
          onSuccess: () => {
            console.log('Avatar uploaded successfully');
            setUploadingAvatar(false);
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
          },
          onError: (error) => {
            console.error('Failed to update avatar:', error);
            setUploadingAvatar(false);
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
          },
        }
      );
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
          <button
            type="button"
            onClick={handleAvatarClick}
            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full"
            aria-label="Change profile photo"
          >
            <Avatar
              src={getAvatarUrl(user?.profilePictureUrl)}
              alt={user?.username || 'User'}
              size="xl"
              className="ring-2 ring-gray-200 dim:ring-gray-600 dark:ring-gray-700"
            />
          </button>
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
          onChange={(e) => setMbti(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {MBTI_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2"
        >
          Location
        </label>
        <div className="flex gap-2">
          <input
            id="location"
            type="text"
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            onKeyDown={handleCityInputKeyDown}
            placeholder="Enter city name"
            className="flex-1 px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={isGettingLocation}
          />
          <Button
            onClick={handleGPSClick}
            disabled={isGettingLocation}
            variant="secondary"
            size="sm"
            aria-label="Use current location"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        variant="primary"
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

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
