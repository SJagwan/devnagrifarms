const addressRepository = require("../repositories/address.repository");
const serviceableAreaService = require("./serviceable-area.service");
const AppError = require("../utils/AppError");
const { Subscription } = require("../models");

/**
 * Get all addresses for a user, ordered by default-first then newest.
 */
const getUserAddresses = async (userId) => {
  return await addressRepository.getAddressesByUserId(userId);
};

/**
 * Get a single address by ID, scoped to the user.
 */
const getAddressById = async (userId, addressId) => {
  const address = await addressRepository.getAddressById(addressId, userId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }
  return address;
};

/**
 * Create a new address after verifying serviceability.
 */
const addUserAddress = async (userId, addressData) => {
  const result = await serviceableAreaService.checkPointServiceability({
    lat: addressData.latitude,
    lng: addressData.longitude,
  });

  if (!result.serviceable) {
    throw new AppError("Location is outside our serviceable area", 400);
  }

  return await addressRepository.createAddress({
    ...addressData,
    user_id: userId,
  });
};

/**
 * Update an existing address. Re-checks serviceability if lat/lng changed.
 */
const updateUserAddress = async (userId, addressId, data) => {
  // If lat/lng are being changed, re-verify serviceability
  if (data.latitude !== undefined || data.longitude !== undefined) {
    const existing = await addressRepository.getAddressById(addressId, userId);
    if (!existing) {
      throw new AppError("Address not found", 404);
    }

    const lat = data.latitude ?? existing.latitude;
    const lng = data.longitude ?? existing.longitude;

    const result = await serviceableAreaService.checkPointServiceability({
      lat,
      lng,
    });

    if (!result.serviceable) {
      throw new AppError("Updated location is outside our serviceable area", 400);
    }
  }

  const updated = await addressRepository.updateAddress(addressId, userId, data);
  if (!updated) {
    throw new AppError("Address not found", 404);
  }

  return updated;
};

/**
 * Delete an address. Blocks deletion if it's tied to an active subscription.
 */
const deleteUserAddress = async (userId, addressId) => {
  const address = await addressRepository.getAddressById(addressId, userId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  // Block deletion of the default address
  if (address.is_default) {
    throw new AppError(
      "Cannot delete your default address. Please set another address as default first.",
      409
    );
  }

  // Block deletion if address is tied to an active subscription
  const activeSubscription = await Subscription.findOne({
    where: {
      user_id: userId,
      shipping_address_id: addressId,
      status: "active",
    },
  });

  if (activeSubscription) {
    throw new AppError(
      "Cannot delete this address — it is linked to an active subscription. Please update the subscription first.",
      409
    );
  }

  const deletedCount = await addressRepository.deleteAddress(addressId, userId);
  if (deletedCount === 0) {
    throw new AppError("Address not found", 404);
  }

  return { message: "Address deleted successfully" };
};

/**
 * Set an address as the user's default delivery address.
 */
const setDefaultAddress = async (userId, addressId) => {
  const address = await addressRepository.setDefaultAddress(addressId, userId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }
  return address;
};

module.exports = {
  getUserAddresses,
  getAddressById,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
};
