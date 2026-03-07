import * as Location from 'expo-location';

/**
 * Service for handling device location (GPS)
 */
export const locationService = {
  /**
   * Request foreground permissions
   * @returns {Promise<boolean>}
   */
  requestPermissions: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Get current device position with a timeout
   * @param {number} timeoutMs - Max time to wait for GPS
   * @returns {Promise<Location.LocationObject>}
   */
  getCurrentPosition: async (timeoutMs = 10000) => {
    const gpsPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), timeoutMs)
    );

    // Race the GPS request against the timeout
    return Promise.race([gpsPromise, timeoutPromise]);
  },

  /**
   * Get approx coordinates for a pincode (Native fallback)
   * @param {string} pincode 
   * @returns {Promise<Location.LocationGeocodedLocation | null>}
   */
  geocodePincode: async (pincode) => {
    try {
      const results = await Location.geocodeAsync(pincode);
      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Geocoding failed for pincode:', pincode, error);
      return null;
    }
  }
};
