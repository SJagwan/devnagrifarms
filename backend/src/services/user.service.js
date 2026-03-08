const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");
const storageService = require("./storage.service");

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

const updateUserProfile = async (id, data) => {
  const user = await userRepository.findUserById(id, false);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updateData = {
    first_name: data.first_name !== undefined ? data.first_name : user.first_name,
    last_name: data.last_name !== undefined ? data.last_name : user.last_name,
    avatar_url: data.avatar_url !== undefined ? data.avatar_url : user.avatar_url,
  };

  // If email is provided and it's different from the current email
  if (data.email && data.email !== user.email) {
    // Check if another user is already using this email
    const existingUserWithEmail = await userRepository.findUserByEmail(data.email);
    
    // We only block the update if the existing user has actually VERIFIED this email.
    // Multiple users can claim the same unverified email. The true owner is the first to verify it.
    if (existingUserWithEmail && existingUserWithEmail.id !== id && existingUserWithEmail.email_verified_at !== null) {
      throw new AppError("This email is already registered and verified by another account", 409);
    }
    
    updateData.email = data.email;
    // When an email is changed, it immediately becomes unverified
    updateData.email_verified_at = null;
  }

  await userRepository.updateUser(id, updateData);
  
  // Cleanup old avatar from S3 if it changed or was removed
  if (data.avatar_url !== undefined && user.avatar_url && data.avatar_url !== user.avatar_url) {
    await storageService.deleteObjectByUrl(user.avatar_url);
  } else if (data.avatar_url === "" && user.avatar_url) {
    await storageService.deleteObjectByUrl(user.avatar_url);
  }

  return {
    id: user.id,
    first_name: updateData.first_name,
    last_name: updateData.last_name,
    email: updateData.email || user.email,
    email_verified: updateData.email !== undefined
      ? false // email was changed, so unverified
      : !!user.email_verified_at, // email untouched, return actual status
    phone: user.phone,
    avatar_url: updateData.avatar_url,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserProfile,
};
