// --- Seller Constants ---
export const SELLER_DETAILS = {
  legal_name: "NIKHIL NEGI",
  trade_name: "Devnagri Farms",
  name: "Devnagri Farms",
  address: "Ganeshpur, C/O Mrs Anita Negi, Shimla By Pass Road, Raghunathpur, Dehradun, Uttarakhand - 248007",
  gstin: "05BUZPN4498K1ZI",
  state: "Uttarakhand",
  state_code: "05",
  phone: "8864812612",
  email: "devnagrifarms@gmail.com",
};

// --- Financial Year ---
export function getFinancialYear(date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${String(fyStart).slice(2)}${String(fyEnd).slice(2)}`;
}

// --- Tax Calculation ---
const round2 = (n) => Math.round(n * 100) / 100;

export function calculateTax(lineTotal, taxPercent) {
  const taxAmount = round2((lineTotal * taxPercent) / 100);
  const cgstAmount = round2(taxAmount / 2);
  const sgstAmount = round2(taxAmount - cgstAmount); // Avoids rounding drift
  return {
    cgst_rate: taxPercent / 2,
    sgst_rate: taxPercent / 2,
    igst_rate: 0,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: 0,
    tax_amount: taxAmount,
    total: round2(lineTotal + taxAmount),
  };
}

// --- Document Type ---
export function determineDocumentType(items) {
  const hasExempt = items.some((i) => !i.tax_percent || i.tax_percent === 0);
  const hasTaxable = items.some((i) => i.tax_percent && i.tax_percent > 0);
  if (hasExempt && hasTaxable) return "Invoice-cum-Bill of Supply";
  if (hasTaxable) return "Tax Invoice";
  return "Bill of Supply";
}

// --- Number to Words (Indian English) ---
const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertHundreds(num) {
  let result = "";
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " Hundred";
    num %= 100;
    if (num > 0) result += " and ";
  }
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += " " + ones[num];
  } else if (num > 0) {
    result += ones[num];
  }
  return result;
}

export function numberToWords(amount) {
  if (!amount || amount === 0) return "Zero Rupees Only";
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = "";
  if (rupees > 0) {
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    if (crore > 0) result += convertHundreds(crore) + " Crore ";
    if (lakh > 0) result += convertHundreds(lakh) + " Lakh ";
    if (thousand > 0) result += convertHundreds(thousand) + " Thousand ";
    if (hundred > 0) result += convertHundreds(hundred);
    result = result.trim() + " Rupees";
  }

  if (paise > 0) {
    if (rupees > 0) result += " and ";
    result += convertHundreds(paise) + " Paise";
  }

  return result.trim() + " Only";
}
