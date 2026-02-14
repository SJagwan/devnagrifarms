const addressRepository = require("../repositories/address.repository");
const serviceableAreaService = require("./serviceable-area.service");
const AppError = require("../utils/AppError");

const getUserAddresses = async (userId) => {
  return await addressRepository.getAddressesByUserId(userId);
};

const addUserAddress = async (userId, addressData) => {
  // 1. Check Serviceability
  const result = await serviceableAreaService.checkPointServiceability({
    lat: addressData.latitude,
    lng: addressData.longitude,
  });

  if (!result.serviceable) {
    throw new AppError("Location is outside our serviceable area", 400);
  }

  // 2. Create Address
  return await addressRepository.createAddress({
    ...addressData,
    user_id: userId,
  });
};

module.exports = {
  getUserAddresses,
  addUserAddress,
};
