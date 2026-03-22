const asyncHandler = require("../middlewares/asyncHandler");
const invoiceService = require("../services/invoice.service");

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceData(req.params.id);
  res.json({
    success: true,
    data: invoice,
  });
});

module.exports = { getInvoice };
