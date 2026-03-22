const { Op } = require("sequelize");
const { Order, OrderItem, User, ProductVariant, Product, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const numberToWords = require("../utils/numberToWords");
const invoiceConfig = require("../constants/invoice.constants");

const generateInvoiceNumber = async (order) => {
  if (order.invoice_number) return order.invoice_number;

  // Use transaction to prevent race conditions
  return sequelize.transaction(async (t) => {
    const fy = invoiceConfig.getFinancialYear(new Date());
    const prefix = invoiceConfig.INVOICE_PREFIX;
    const seriesPrefix = `${prefix}/${fy}/`;

    // Find highest existing number in this FY with row lock
    const lastInvoice = await Order.findOne({
      where: { invoice_number: { [Op.like]: `${seriesPrefix}%` } },
      attributes: ["invoice_number"],
      order: [["invoice_number", "DESC"]],
      lock: t.LOCK.UPDATE,
      transaction: t,
      raw: true,
    });

    let nextSeq = 1;
    if (lastInvoice?.invoice_number) {
      const lastSeq = parseInt(lastInvoice.invoice_number.replace(seriesPrefix, ""), 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    const invoiceNumber = `${seriesPrefix}${String(nextSeq).padStart(5, "0")}`;

    await Order.update(
      { invoice_number: invoiceNumber },
      { where: { id: order.id }, transaction: t }
    );

    return invoiceNumber;
  });
};

const getInvoiceData = async (orderId) => {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "phone", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            attributes: ["sku", "type", "source", "quantity", "unit"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["name", "description", "hsn_code"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (!order.items || order.items.length === 0) {
    throw new AppError("Order has no items", 400);
  }

  // Generate invoice number if not exists
  const invoiceNumber = await generateInvoiceNumber(order);

  // Determine document type
  const hasExemptItems = order.items.some(
    (item) => !item.tax_percent || parseFloat(item.tax_percent) === 0
  );
  const hasTaxableItems = order.items.some(
    (item) => item.tax_percent && parseFloat(item.tax_percent) > 0
  );

  let documentType;
  if (hasExemptItems && hasTaxableItems) {
    documentType = "Invoice-cum-Bill of Supply";
  } else if (hasTaxableItems) {
    documentType = "Tax Invoice";
  } else {
    documentType = "Bill of Supply";
  }

  // Separate exempt and taxable totals
  let exemptTotal = 0;
  let taxableTotal = 0;

  const lineItems = order.items.map((item) => {
    const taxPercent = parseFloat(item.tax_percent || 0);
    const qty = parseFloat(item.quantity || 0);
    const price = parseFloat(item.price || 0);
    const lineTotal = qty * price;

    if (taxPercent === 0) {
      exemptTotal += lineTotal;
    } else {
      taxableTotal += lineTotal;
    }

    return {
      description: item.variant?.product?.name || "Product",
      hsn_code: item.hsn_code || item.variant?.product?.hsn_code || "-",
      sku: item.variant?.sku || "-",
      variant_type: item.variant?.type || "",
      variant_source: item.variant?.source || "",
      quantity: qty,
      unit: item.variant?.unit || "pcs",
      unit_price: price,
      line_total: lineTotal,
      tax_percent: taxPercent,
      cgst_rate: parseFloat(item.cgst_rate || 0),
      sgst_rate: parseFloat(item.sgst_rate || 0),
      igst_rate: parseFloat(item.igst_rate || 0),
      cgst_amount: parseFloat(item.cgst_amount || 0),
      sgst_amount: parseFloat(item.sgst_amount || 0),
      igst_amount: parseFloat(item.igst_amount || 0),
      tax_amount: parseFloat(item.tax_amount || 0),
      total_price: parseFloat(item.total_price || 0),
      discount_percent: parseFloat(item.discount_percent || 0),
    };
  });

  const address = order.shipping_address_snapshot || {};

  return {
    document_type: documentType,
    invoice_number: invoiceNumber,
    invoice_date: order.delivery_date || order.created_at,
    order_id: order.id,
    order_status: order.status,
    payment_status: order.payment_status,

    seller: {
      name: invoiceConfig.SELLER_NAME,
      address: invoiceConfig.SELLER_ADDRESS,
      gstin: invoiceConfig.SELLER_GSTIN,
      state: invoiceConfig.SELLER_STATE,
      state_code: invoiceConfig.SELLER_STATE_CODE,
      phone: invoiceConfig.SELLER_PHONE,
      email: invoiceConfig.SELLER_EMAIL,
    },

    buyer: {
      name: `${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim(),
      phone: order.user?.phone || address.phone || "",
      email: order.user?.email || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || "",
    },

    items: lineItems,

    summary: {
      exempt_total: exemptTotal,
      taxable_total: taxableTotal,
      cgst_total: parseFloat(order.cgst_total || 0),
      sgst_total: parseFloat(order.sgst_total || 0),
      igst_total: parseFloat(order.igst_total || 0),
      total_tax: parseFloat(order.total_tax || 0),
      discount_total: parseFloat(order.discount_total || 0),
      grand_total: parseFloat(order.total_price || 0),
      grand_total_in_words: numberToWords(parseFloat(order.total_price || 0)),
    },

    delivery: {
      date: order.delivery_date,
      slot: order.delivery_slot,
    },

    reverse_charge: false,
    place_of_supply: `${invoiceConfig.SELLER_STATE} (${invoiceConfig.SELLER_STATE_CODE})`,
  };
};

module.exports = { getInvoiceData };
