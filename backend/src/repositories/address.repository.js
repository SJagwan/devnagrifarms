const { AddressUser, sequelize } = require("../models");
const AppError = require("../utils/AppError");

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

/**
 * Create an address. If is_default is true, atomically unset old defaults first.
 */
const createAddress = async (addressData) => {
  return await sequelize.transaction(async (t) => {
    // Check if user has any existing addresses
    const count = await AddressUser.count({
      where: { user_id: addressData.user_id },
      transaction: t,
    });

    // If it's the first address, it MUST be the default
    if (count === 0) {
      addressData.is_default = true;
    }

    if (addressData.is_default) {
      await AddressUser.update(
        { is_default: false },
        { where: { user_id: addressData.user_id }, transaction: t }
      );
    }
    return await AddressUser.create(addressData, { transaction: t });
  });
};

/**
 * Update an address. If is_default is true, atomically unset old defaults first.
 */
const updateAddress = async (id, userId, data) => {
  return await sequelize.transaction(async (t) => {
    const address = await AddressUser.findOne({
      where: { id, user_id: userId },
      transaction: t,
    });

    if (!address) return null;

    if (data.is_default === true) {
      await AddressUser.update(
        { is_default: false },
        { where: { user_id: userId }, transaction: t }
      );
    } else if (data.is_default === false && address.is_default) {
      // Trying to unset default. Check if it's their only address.
      const count = await AddressUser.count({
        where: { user_id: userId },
        transaction: t,
      });
      // If it's the only address, reject the request entirely.
      if (count <= 1) {
        throw new AppError("You must have at least one default address. Please set another address as default first.", 400);
      }
    }

    await address.update(data, { transaction: t });
    return address;
  });
};

/**
 * Delete an address by id (hard delete). Returns count of deleted rows.
 */
const deleteAddress = async (id, userId) => {
  return await AddressUser.destroy({
    where: { id, user_id: userId },
  });
};

/**
 * Atomically set one address as default and unset all others.
 */
const setDefaultAddress = async (id, userId) => {
  return await sequelize.transaction(async (t) => {
    const address = await AddressUser.findOne({
      where: { id, user_id: userId },
      transaction: t,
    });

    if (!address) return null;

    await AddressUser.update(
      { is_default: false },
      { where: { user_id: userId }, transaction: t }
    );

    await address.update({ is_default: true }, { transaction: t });
    return address;
  });
};

module.exports = {
  getAddressById,
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
