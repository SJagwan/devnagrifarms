const asyncHandler = require("../middlewares/asyncHandler");
const addressService = require("../services/address.service");

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addUserAddress(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: address,
    message: "Address added successfully",
  });
});

module.exports = {
  getAddresses,
  addAddress,
};
