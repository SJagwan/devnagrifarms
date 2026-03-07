const asyncHandler = require("../middlewares/asyncHandler");
const userService = require("../services/user.service");

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.json({
    success: true,
    data: result,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    data: user,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await userService.updateUserStatus(req.params.id, status, req.user.id);
  res.json({
    success: true,
    data: result,
    message: `User status updated to ${status}`,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const targetUserId = (req.user.userType === "admin" && req.params.id) ? req.params.id : req.user.id;
  const result = await userService.updateUserProfile(targetUserId, req.body);
  res.json({
    success: true,
    data: result,
    message: "Profile updated successfully",
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateStatus,
  updateProfile,
};
