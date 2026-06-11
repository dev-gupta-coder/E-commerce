import { CURRENCY, CURRENCY_SYMBOL, PAISE_MULTIPLIER } from "@/constants/app.constants";

export const formatPrice = (paise = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: CURRENCY, minimumFractionDigits: 0 })
    .format(paise / PAISE_MULTIPLIER);

export const paiseToRupees = (paise = 0) => paise / PAISE_MULTIPLIER;
export const rupeesToPaise = (rupees = 0) => Math.round(rupees * PAISE_MULTIPLIER);
