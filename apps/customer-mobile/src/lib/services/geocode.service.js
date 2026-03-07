import * as Location from "expo-location";

/**
 * Service for reverse geocoding and parsing address objects
 */
export const geocodeService = {
  /**
   * Reverse geocode a latitude and longitude
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object | null>}
   */
  reverseGeocode: async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results && results.length > 0) {
        return geocodeService.parseExpoLocation(
          results[0],
          latitude,
          longitude,
        );
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  },

  /**
   * Parse the Expo Location result into our standardized address model
   * @param {Location.LocationGeocodedAddress} place
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object}
   */
  parseExpoLocation: (place, latitude, longitude) => {
    // Standardize City Detection (Priority: city -> district -> subregion -> region)
    const city = place.city || place.district || place.subregion || "";
    const state = place.region || "";
    const pincode = place.postalCode || "";

    // Build a readable address string (locality/name -> subregion/district -> city)
    const parts = [];
    if (place.name && place.name !== place.street) parts.push(place.name);
    if (place.street) parts.push(place.street);
    if (place.subregion || place.district)
      parts.push(place.subregion || place.district);
    if (place.city) parts.push(place.city);

    // Fallback if parts is empty
    const addressLine =
      parts.length > 0 ? parts.join(", ") : state || "Unknown Location";

    return {
      lat: latitude,
      lng: longitude,
      addressLine,
      city,
      state,
      pincode,
    };
  },
};
