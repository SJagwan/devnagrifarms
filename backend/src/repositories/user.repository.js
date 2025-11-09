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

module.exports = {
  findUserById,
  findUserByIdentifier,
};
