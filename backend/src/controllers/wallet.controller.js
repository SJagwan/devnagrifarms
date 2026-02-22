const asyncHandler = require("../middlewares/asyncHandler");
const walletService = require("../services/wallet.service");

const getMyPassbook = asyncHandler(async (req, res) => {
  const result = await walletService.getPassbook(req.user.id, req.query);
  res.json({
    success: true,
    data: result,
  });
});

const adminManualAdjustment = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, description } = req.body;
  
  const result = await walletService.manualAdjustment(userId, amount, description, req.user.id);
  
  res.json({
    success: true,
    data: result,
    message: "Wallet adjusted successfully",
  });
});

const adminGetUserPassbook = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await walletService.getPassbook(userId, req.query);
  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  getMyPassbook,
  adminManualAdjustment,
  adminGetUserPassbook,
};
