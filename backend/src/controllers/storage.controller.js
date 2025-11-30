const asyncHandler = require("../middlewares/asyncHandler");
const storageService = require("../services/storage.service");

exports.getPresignedUploadUrl = asyncHandler(async (req, res) => {
  const { key, contentType, expiresIn } = req.body || {};
  const result = await storageService.getPresignedPutUrl({
    key,
    contentType,
    expiresIn: Number(expiresIn) || 300,
  });
  res.json({ success: true, data: result });
});

exports.deleteObject = asyncHandler(async (req, res) => {
  const { key } = req.body || {};
  const result = await storageService.deleteObject(key);
  res.json({ success: true, data: result });
});
