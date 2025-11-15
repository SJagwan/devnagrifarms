const { User, Sequelize } = require("../models");
const { Op } = Sequelize;

const findUserById = async (id, activeOnly = true) => {
  const where = { id };
  if (activeOnly) where.status = User.USER_STATUS.ACTIVE;

  return await User.findOne({
    where,
    attributes: {
      exclude: [
        "password_hash",
        "otp_code",
        "otp_expires_at",
        "created_at",
        "updated_at",
      ],
    },
  });
};

const findUserByIdentifier = async (identifier, activeOnly = true) => {
  const where = {
    [Op.or]: [{ phone: identifier }, { email: identifier }],
  };
  if (activeOnly) where.status = User.USER_STATUS.ACTIVE;

  return await User.findOne({
    where,
    attributes: {
      exclude: [
        "password_hash",
        "otp_code",
        "otp_expires_at",
        "created_at",
        "updated_at",
      ],
    },
  });
};

const findUserForAuth = async (email, userType = null) => {
  const where = { email };
  if (userType) where.user_type = userType;

  return await User.findOne({
    where,
    attributes: [
      "id",
      "first_name",
      "last_name",
      "email",
      "phone",
      "password_hash",
      "user_type",
      "status",
    ],
  });
};

module.exports = {
  findUserById,
  findUserByIdentifier,
  findUserForAuth,
};
