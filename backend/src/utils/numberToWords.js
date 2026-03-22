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

/**
 * Convert a number to Indian English words (up to 99,99,99,999)
 * Uses Indian numbering: Crore, Lakh, Thousand, Hundred
 * @param {number} amount - The amount in rupees (can have paise)
 * @returns {string} e.g., "Four Hundred and Ninety-Five Rupees and Fifty Paise Only"
 */
function numberToWords(amount) {
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

module.exports = numberToWords;
