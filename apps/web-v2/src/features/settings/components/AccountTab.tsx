import { Camera, Loader2, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PigeonIdRegenerator } from '@/components/PigeonIdRegenerator';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PolarityToggle, type PolarityValue } from '@/components/ui/PolarityToggle';
import { useAuth } from '@/features/auth/context/useAuth';
import { uploadImage } from '@/features/posts/api/s3Service';
import { compressImage } from '@/features/posts/utils/imageUtils';
import { useLocationGPS } from '@/hooks/useLocationGPS';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import api from '@/lib/api';
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
  const { user } = useAuth();
  const { queueUpdate } = useAccountUpdates();
  const { isGettingLocation, getGPSLocation } = useLocationGPS();
  const { isOnline } = useNetworkStatus();

  // Form state (editable)
  const [bio, setBio] = useState(user?.bio || '');
  const [mbti, setMbti] = useState(user?.mbtiPersonality || 'INFJ');
  const [locationCity, setLocationCity] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [polarity, setPolarity] = useState<PolarityValue>(
    (user?.polarity?.toUpperCase() as PolarityValue) || 'YANG'
  );
  const [polarityError, setPolarityError] = useState(false);

  // UI state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      const userBio = user.bio || '';
      const userMbti = user.mbtiPersonality || 'INFJ';
      const userPolarity = user.polarity?.toUpperCase() as PolarityValue;

      setBio(userBio);
      setMbti(userMbti);

      if (!userPolarity || (userPolarity !== 'YIN' && userPolarity !== 'YANG')) {
        setPolarity(null);
        setPolarityError(true);
      } else {
        setPolarity(userPolarity);
        setPolarityError(false);
      }

      // Initialize location display (city only for now until backend supports state/country)
      if (user.location) {
        const display = user.location.city || '';
        console.log('Initializing location from user data:', {
          city: user.location.city,
          lat: user.location.latitude,
          lon: user.location.longitude,
        });

        setLocationCity(display); // Initialize the input field
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

  // GPS handler
  // GPS handler with auto-save
  const handleGPSClick = async () => {
    if (!isOnline) return; // Prevent action when offline
    const result = await getGPSLocation();
    if (result) {
      const newCoords = { lat: result.lat, lon: result.lon };
      setLocationCoords(newCoords);
      setLocationCity(result.city || '');

      // Auto-save GPS location immediately
      queueUpdate(
        {
          location: {
            lat: result.lat,
            lon: result.lon,
            city: result.city || '',
          },
        },
        {
          onError: (error) => {
            // ZEN: Silent error log, revert state
            console.error('Failed to update GPS location:', error);
            // Revert to previous values (user data)
            if (user?.location?.latitude && user.location.longitude) {
              setLocationCoords({
                lat: user.location.latitude,
                lon: user.location.longitude,
              });
              setLocationCity(user.location.city || '');
            }
          },
        }
      );
      console.log('GPS location auto-saved:', result.city);
    }
  };

  // Handle manual city input
  const handleCityInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationCity.trim()) {
      e.preventDefault();
      // Trigger blur to save
      (e.target as HTMLInputElement).blur();
    }
  };

  // Location auto-save (onBlur pattern with geocoding)
  const handleLocationBlur = async () => {
    if (!isOnline) return; // Prevent action when offline
    const trimmedCity = locationCity.trim();
    const currentCity = user?.location?.city || '';

    // Only geocode and save if changed
    if (trimmedCity !== currentCity) {
      if (!trimmedCity) {
        // City cleared - keep coords but clear city
        if (locationCoords) {
          queueUpdate(
            {
              location: {
                ...locationCoords,
                city: undefined,
              },
            },
            {
              onError: (error) => {
                console.error('Failed to update location:', error);
                setLocationCity(currentCity);
              },
            }
          );
          console.log('Location city cleared, kept coordinates');
        }
        return;
      }

      try {
        const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
        if (!GEOCODING_URL) {
          throw new Error('VITE_GEOCODING_URL environment variable is required');
        }

        const response = await fetch(
          `${GEOCODING_URL}?q=${encodeURIComponent(trimmedCity)}&format=json&limit=1`
        );

        if (!response.ok) {
          throw new Error('Failed to geocode location');
        }

        const data = await response.json();

        if (data.length === 0) {
          console.error('Location not found');
          // Revert to original
          setLocationCity(currentCity);
          return;
        }

        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Extract city from result
        const address = result.address || {};
        const city =
          address.city || address.town || address.village || address.municipality || result.name;
        const display = city || result.display_name;

        const newCoords = { lat, lon };
        setLocationCoords(newCoords);
        setLocationCity(display);

        // Auto-save location
        queueUpdate(
          {
            location: {
              lat,
              lon,
              city: display,
            },
          },
          {
            onError: (error) => {
              console.error('Failed to update location:', error);
              // Revert to previous values
              setLocationCity(currentCity);
              if (user?.location?.latitude && user.location.longitude) {
                setLocationCoords({
                  lat: user.location.latitude,
                  lon: user.location.longitude,
                });
              }
            },
          }
        );
        console.log('Location auto-saved:', display);
      } catch (error) {
        console.error('Geocoding error:', error);
        // Revert to original
        setLocationCity(currentCity);
      }
    }
  };

  // Bio auto-save (onBlur pattern)
  const handleBioBlur = () => {
    if (!isOnline) return; // Prevent action when offline
    const trimmedBio = bio.trim();
    const currentUserBio = user?.bio || '';

    // Only save if changed
    if (trimmedBio !== currentUserBio) {
      const previousBio = currentUserBio;
      queueUpdate(
        { bio: trimmedBio },
        {
          onError: (error) => {
            // ZEN: Silent revert on error, log to console only
            console.error('Failed to update bio:', error);
            setBio(previousBio);
          },
        }
      );
      console.log('Bio auto-saved:', trimmedBio);
    }
  };

  // Fetch-first polarity toggle handler
  const handlePolarityToggle = async () => {
    if (!isOnline) return;
    if (!user?.userId) {
      console.error('User ID not available');
      setPolarity(null);
      setPolarityError(true);
      return;
    }

    try {
      // Fetch current state first
      const currentUser = (await api.get(`/users/${user.userId}/profile`)) as { polarity?: string };
      const serverPolarity = (currentUser.polarity?.toUpperCase() as PolarityValue) || 'YANG';

      // Determine new polarity
      let newPolarity: PolarityValue;
      if (polarity === null) {
        newPolarity = 'YANG'; // Default when recovering
      } else {
        newPolarity = serverPolarity === 'YIN' ? 'YANG' : 'YIN';
      }

      // Update server
      await api.patch(`/users/${user.userId}`, { polarity: newPolarity.toLowerCase() });

      // Update UI only after success
      setPolarity(newPolarity);
      setPolarityError(false);
    } catch (error) {
      console.error('Failed to update polarity:', error);
      setPolarity(null);
      setPolarityError(true);
    }
  };

  // MBTI auto-save (onChange immediate - polarity pattern)
  const handleMbtiChange = (newMbti: string) => {
    if (!isOnline) return; // Prevent action when offline
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
    console.log('MBTI auto-saved:', newMbti);
  };

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOnline) return; // Prevent action when offline
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

  return (
    <div className="p-4 space-y-6">
      {/* Profile Photo */}
      <div>
        <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
          Profile Photo
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={!isOnline}
            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
            aria-label="Change profile photo"
          >
            <Avatar
              src={getAvatarUrl(user?.profilePictureUrl)}
              alt={user?.userName || 'User'}
              size="xl"
            />
          </button>
          <Button
            onClick={handleAvatarClick}
            disabled={!isOnline || uploadingAvatar}
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
          disabled={!isOnline}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={!isOnline}
          className="w-full px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
            onBlur={handleLocationBlur}
            placeholder="Enter city name"
            className="flex-1 px-3 py-2 border border-gray-300 dim:border-gray-500 dark:border-gray-600 rounded-lg bg-white dim:bg-gray-700 dark:bg-gray-800 text-gray-900 dim:text-gray-100 dark:text-gray-100 placeholder-gray-500 dim:placeholder-gray-450 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isOnline || isGettingLocation}
          />
          <Button
            onClick={handleGPSClick}
            disabled={!isOnline || isGettingLocation}
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

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Polarity */}
      <div>
        <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
          Polarity
        </div>
        <PolarityToggle
          value={polarity}
          onChange={setPolarity}
          onToggle={handlePolarityToggle}
          disabled={!isOnline}
          showError={polarityError}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Security */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-3">
          Security
        </h3>

        {user && (
          <PigeonIdRegenerator
            userId={user.userId}
            userName={user.userName}
            context="user"
            isOnline={isOnline}
          />
        )}
      </div>
    </div>
  );
}
