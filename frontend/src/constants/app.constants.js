export const APP_NAME      = import.meta.env.VITE_APP_NAME ?? "ShopEase";
export const RAZORPAY_KEY  = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";
export const CURRENCY      = "INR";
export const CURRENCY_SYMBOL = "₹";
export const PAISE_MULTIPLIER = 100;

export const ORDER_STATUSES = ["pending","confirmed","packed","shipped","delivered","cancelled"];
export const PAYMENT_STATUSES = ["pending","paid","failed","refunded"];

export const SORT_OPTIONS = [
  { label: "Newest",        value: "newest" },
  { label: "Price: Low",    value: "price-asc" },
  { label: "Price: High",   value: "price-desc" },
  { label: "Top Rated",     value: "rating-desc" },
  { label: "Most Popular",  value: "popular" },
];

export const ITEMS_PER_PAGE = 12;
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Books",
  "Home",
  "Beauty",
  "Sports",
  "Other",
];