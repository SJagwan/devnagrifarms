const { AddressUser } = require("../models");

const getAddressById = async (id, userId) => {
  return await AddressUser.findOne({
    where: {
      id,
      user_id: userId,
    },
  });
};

const getAddressesByUserId = async (userId) => {
  return await AddressUser.findAll({
    where: { user_id: userId },
    order: [["is_default", "DESC"], ["created_at", "DESC"]],
  });
};

const createAddress = async (addressData) => {
  // If set as default, unset other defaults for this user
  if (addressData.is_default) {
    await AddressUser.update(
      { is_default: false },
      { where: { user_id: addressData.user_id } }
    );
  }
  return await AddressUser.create(addressData);
};

module.exports = {
  getAddressById,
  getAddressesByUserId,
  createAddress,
};
