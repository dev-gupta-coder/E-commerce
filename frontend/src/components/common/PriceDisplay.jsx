import { formatPrice } from "@/utils/formatPrice";
const PriceDisplay = ({ price, discountPrice, className = "" }) => (
  <div className={`flex items-baseline gap-2 ${className}`}>
    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(discountPrice ?? price)}</span>
    {discountPrice && discountPrice < price && <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>}
  </div>
);
export default PriceDisplay;
