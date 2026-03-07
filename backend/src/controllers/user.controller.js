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
  const { first_name, last_name, email } = req.body;
  const result = await userService.updateUserProfile(req.user.id, { first_name, last_name, email });
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
