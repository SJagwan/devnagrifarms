const asyncHandler = require("../middlewares/asyncHandler");
const walletService = require("../services/wallet.service");

const getMyPassbook = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await walletService.getPassbook(req.user.id, { page, limit });
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
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await walletService.getPassbook(userId, { page, limit });
  res.json({
    success: true,
    data: result,
  });
});

const adminGetAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { type, userId } = req.query;

  const result = await walletService.getAllTransactions({ page, limit, type, userId });
  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  getMyPassbook,
  adminManualAdjustment,
  adminGetUserPassbook,
  adminGetAllTransactions,
};
