const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");

const getAllUsers = async (query) => {
  const { page = 1, limit = 10, userType, status, search, sortBy, sortDir } = query;

  const { rows, count } = await userRepository.getUsersPaged({
    page: Number(page),
    limit: Number(limit),
    userType,
    status,
    search,
    sortBy,
    sortDir,
  });

  const totalPages = Math.ceil(count / limit) || 1;

  return {
    items: rows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages,
    },
  };
};

const getUserById = async (id) => {
  const user = await userRepository.getUserByIdFull(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

const updateUserStatus = async (id, status, adminId) => {
  if (id === adminId) {
    throw new AppError("You cannot change your own status", 400);
  }

  const user = await userRepository.findUserById(id, false);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await userRepository.updateUser(id, { status });
  return { id, status };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
};
