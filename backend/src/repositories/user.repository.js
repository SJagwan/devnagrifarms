const { User, AddressUser, Order, Subscription, Sequelize } = require("../models");
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

const getUsersPaged = async ({
  page = 1,
  limit = 10,
  userType,
  status,
  search,
  sortBy = "created_at",
  sortDir = "DESC",
}) => {
  const where = {};

  if (userType) where.user_type = userType;
  if (status) where.status = status;

  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const order = [[sortBy, sortDir]];

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order,
    attributes: {
      exclude: ["password_hash", "otp_code", "otp_expires_at"],
    },
  });

  return { rows, count };
};

const getUserByIdFull = async (id) => {
  return await User.findByPk(id, {
    attributes: {
      exclude: ["password_hash", "otp_code", "otp_expires_at"],
    },
    include: [
      { model: AddressUser, as: "addresses" },
      {
        model: Order,
        as: "orders",
        limit: 5,
        order: [["created_at", "DESC"]],
      },
      {
        model: Subscription,
        as: "subscriptions",
        limit: 5,
        order: [["created_at", "DESC"]],
      },
    ],
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

const findUserForAuth = async (identifier, userType = null) => {
  const where = {
    [Op.or]: [{ email: identifier }, { phone: identifier }],
  };
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
      "otp_code",
      "otp_expires_at",
      "phone_verified_at",
      "user_type",
      "status",
    ],
  });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const updateUser = async (id, updateData, transaction) => {
  const [updatedRows] = await User.update(updateData, {
    where: { id },
    transaction,
  });
  return updatedRows > 0;
};

module.exports = {
  findUserById,
  getUsersPaged,
  getUserByIdFull,
  findUserByIdentifier,
  findUserForAuth,
  createUser,
  updateUser,
};
