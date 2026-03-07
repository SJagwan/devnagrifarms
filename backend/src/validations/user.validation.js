const Joi = require("joi");

const updateProfile = {
  body: Joi.object({
    first_name: Joi.string().trim().min(1).max(50),
    last_name: Joi.string().trim().allow("").max(50),
    email: Joi.string().email().allow("", null),
  }),
};

const updateStatus = {
  body: Joi.object({
    status: Joi.string().valid("active", "inactive", "blocked").required(),
  }),
};

module.exports = {
  updateProfile,
  updateStatus,
};
