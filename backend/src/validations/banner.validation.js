const Joi = require("joi");

const createBanner = {
  body: Joi.object({
    position: Joi.string()
      .valid("HOME_CAROUSEL", "HOME_STRIP", "CART_PROMO", "SUB_OFFER", "PRODUCT_PAGE")
      .required(),
    audience: Joi.string()
      .valid("ALL", "NEW_USERS", "EXISTING_USERS", "NON_SUBSCRIBERS")
      .required(),
    title: Joi.string().max(100).allow("", null),
    subtitle: Joi.string().max(255).allow("", null),
    image_url: Joi.string().uri().required(),
    cta_text: Joi.string().max(50).allow("", null),
    link_type: Joi.string()
      .valid("PRODUCT", "CATEGORY", "EXTERNAL", "NONE")
      .required(),
    link_id: Joi.string().uuid().allow(null),
    external_url: Joi.string().uri().max(500).allow("", null),
    display_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
    start_at: Joi.date().iso().allow(null),
    end_at: Joi.date().iso().min(Joi.ref("start_at")).allow(null),
  }),
};

const updateBanner = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    position: Joi.string().valid(
      "HOME_CAROUSEL",
      "HOME_STRIP",
      "CART_PROMO",
      "SUB_OFFER",
      "PRODUCT_PAGE"
    ),
    audience: Joi.string().valid(
      "ALL",
      "NEW_USERS",
      "EXISTING_USERS",
      "NON_SUBSCRIBERS"
    ),
    title: Joi.string().max(100).allow("", null),
    subtitle: Joi.string().max(255).allow("", null),
    image_url: Joi.string().uri(),
    cta_text: Joi.string().max(50).allow("", null),
    link_type: Joi.string().valid("PRODUCT", "CATEGORY", "EXTERNAL", "NONE"),
    link_id: Joi.string().uuid().allow(null),
    external_url: Joi.string().uri().max(500).allow("", null),
    display_order: Joi.number().integer().min(0),
    is_active: Joi.boolean(),
    start_at: Joi.date().iso().allow(null),
    end_at: Joi.date().iso().min(Joi.ref("start_at")).allow(null),
  }).min(1),
};

module.exports = {
  createBanner,
  updateBanner,
};
