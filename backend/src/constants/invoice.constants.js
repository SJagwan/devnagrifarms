module.exports = {
  // Seller / Business details (from GST Registration Certificate)
  SELLER_LEGAL_NAME: "NIKHIL NEGI",
  SELLER_TRADE_NAME: "Devnagri Farms",
  SELLER_NAME: "Devnagri Farms",
  SELLER_ADDRESS: "Ganeshpur, C/O Mrs Anita Negi, Shimla By Pass Road, Raghunathpur, Dehradun, Uttarakhand - 248007",
  SELLER_GSTIN: "05BUZPN4498K1ZI",
  SELLER_STATE: "Uttarakhand",
  SELLER_STATE_CODE: "05",
  SELLER_PHONE: "8864812612",
  SELLER_EMAIL: "devnagrifarms@gmail.com",

  // Invoice numbering
  INVOICE_PREFIX: "DF",

  // Financial year helper — FY runs April 1 to March 31
  getFinancialYear: (date = new Date()) => {
    const month = date.getMonth(); // 0-indexed
    const year = date.getFullYear();
    const fyStart = month >= 3 ? year : year - 1; // April (3) onwards = current FY
    const fyEnd = fyStart + 1;
    return `${String(fyStart).slice(2)}${String(fyEnd).slice(2)}`; // e.g., "2526"
  },

  // Financial year start date
  getFinancialYearStart: (date = new Date()) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const fyStartYear = month >= 3 ? year : year - 1;
    return new Date(fyStartYear, 3, 1); // April 1
  },
};
