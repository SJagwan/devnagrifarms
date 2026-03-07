const asyncHandler = require("../middlewares/asyncHandler");
const addressService = require("../services/address.service");

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

const getAddressById = asyncHandler(async (req, res) => {
  const address = await addressService.getAddressById(req.user.id, req.params.id);
  res.json({ success: true, data: address });
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addUserAddress(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: address,
    message: "Address added successfully",
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateUserAddress(
    req.user.id,
    req.params.id,
    req.body
  );
  res.json({
    success: true,
    data: address,
    message: "Address updated successfully",
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const result = await addressService.deleteUserAddress(req.user.id, req.params.id);
  res.json({ success: true, ...result });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
  res.json({
    success: true,
    data: address,
    message: "Default address updated",
  });
});

module.exports = {
  getAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
