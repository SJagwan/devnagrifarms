import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { locationService } from '@lib/services/location.service';
import { geocodeService } from '@lib/services/geocode.service';

/**
 * Hook for managing location acquisition and geocoding
 */
export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Permissions
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        throw new Error('PERMISSION_DENIED');
      }

      // 2. Acquisition with timeout
      const position = await locationService.getCurrentPosition(12000); // 12s timeout
      const { latitude, longitude } = position.coords;

      // 3. Geocode and Parse
      const address = await geocodeService.reverseGeocode(latitude, longitude);
      if (!address) {
        throw new Error('GEOCODE_FAILED');
      }

      return address;
    } catch (err) {
      console.error('useLocation detectLocation failed:', err);
      let errorMessage = 'Could not fetch your location.';
      
      if (err.message === 'LOCATION_TIMEOUT') {
        errorMessage = 'GPS acquisition timed out. Please try entering a pincode.';
      } else if (err.message === 'PERMISSION_DENIED') {
        errorMessage = 'Location permission is required for auto-detection.';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAddressFromPincode = useCallback(async (pincode) => {
    setLoading(true);
    setError(null);
    try {
      const coords = await locationService.geocodePincode(pincode);
      if (!coords) throw new Error('PINCODE_NOT_FOUND');
      
      const address = await geocodeService.reverseGeocode(coords.latitude, coords.longitude);
      if (address) {
        return { ...address, pincode, source: 'manual' };
      }
      
      // Basic fallback if reverse geocode fails but we have coords
      return {
        lat: coords.latitude,
        lng: coords.longitude,
        pincode,
        city: 'Serviceable Area',
        state: '',
        addressLine: `Pincode Area (${pincode})`,
        source: 'manual'
      };
    } catch (err) {
      setError('Could not verify this pincode.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    detectLocation,
    getAddressFromPincode,
    loading,
    error
  };
}
