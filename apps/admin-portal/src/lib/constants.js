// --- Status Color Maps ---

export const USER_STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  blocked: "bg-red-100 text-red-800",
};

export const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const SUBSCRIPTION_STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

// --- Status Filter Options ---

export const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export const ORDER_STATUS_VALUES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
];

export const SUBSCRIPTION_STATUS_VALUES = ["active", "paused", "cancelled"];

export const USER_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

// --- Schedule Map ---

export const SCHEDULE_MAP = {
  d: "Daily",
  a: "Alternate Days",
  w: "Weekly",
};

// --- Banner Enums ---

export const BANNER_POSITIONS = [
  { value: "HOME_CAROUSEL", label: "Home Carousel" },
  { value: "HOME_STRIP", label: "Home Strip" },
  { value: "CART_PROMO", label: "Cart Promo" },
  { value: "SUB_OFFER", label: "Subscription Offer" },
  { value: "PRODUCT_PAGE", label: "Product Page" },
];

export const BANNER_AUDIENCES = [
  { value: "ALL", label: "All Users" },
  { value: "NEW_USERS", label: "New Users" },
  { value: "EXISTING_USERS", label: "Existing Users" },
  { value: "NON_SUBSCRIBERS", label: "Non-Subscribers" },
];

export const BANNER_LINK_TYPES = [
  { value: "NONE", label: "No Link" },
  { value: "PRODUCT", label: "Product" },
  { value: "CATEGORY", label: "Category" },
  { value: "EXTERNAL", label: "External URL" },
];

// --- Unit Options ---

export const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces" },
  { value: "g", label: "Grams" },
  { value: "kg", label: "Kilograms" },
  { value: "ml", label: "Milliliters" },
  { value: "l", label: "Liters" },
];

export const VARIANT_STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];
