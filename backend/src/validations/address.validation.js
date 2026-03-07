const Joi = require("joi");

const addAddress = {
  body: Joi.object({
    address_type: Joi.string().required(), // Home, Work, etc.
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow("", null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip_code: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    is_default: Joi.boolean().default(false),
  }),
};

module.exports = {
  addAddress,
};
