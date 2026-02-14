const Joi = require("joi");
const asyncHandler = require("../middlewares/asyncHandler");
const addressService = require("../services/address.service");
const AppError = require("../utils/AppError");

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

const addAddress = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    address_type: Joi.string().required(), // Home, Work, etc.
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow("", null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    is_default: Joi.boolean().default(false),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const address = await addressService.addUserAddress(req.user.id, value);

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
