const Joi = require("joi");

const addAddress = {
  body: Joi.object({
    address_type: Joi.string().valid("Home", "Work", "Other").required(),
    address_line_1: Joi.string().max(255).required(),
    address_line_2: Joi.string().max(255).allow("", null),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    zip_code: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({ "string.pattern.base": "Zip code must be exactly 6 digits" }),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    is_default: Joi.boolean().default(false),
  }),
};

const updateAddress = {
  body: Joi.object({
    address_type: Joi.string().valid("Home", "Work", "Other"),
    address_line_1: Joi.string().max(255),
    address_line_2: Joi.string().max(255).allow("", null),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    zip_code: Joi.string()
      .pattern(/^\d{6}$/)
      .messages({ "string.pattern.base": "Zip code must be exactly 6 digits" }),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    is_default: Joi.boolean(),
  }).min(1), // At least one field must be provided
};

const addressIdParam = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

module.exports = {
  addAddress,
  updateAddress,
  addressIdParam,
};
