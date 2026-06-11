import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { formatPrice } from "@/utils/formatPrice";
import RatingStars from "@/components/ui/RatingStars";
import Button from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const toast       = useToast();
  const handleAdd   = async () => { await addItem({ productId: product._id, quantity: 1 }); toast.success("Added to cart"); };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden group">
      <Link to={ROUTES.PRODUCT_DETAIL.replace(":id", product._id)}>
        <img src={product.images?.[0]?.url ?? "/placeholder.png"} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.category}</p>
        <Link to={ROUTES.PRODUCT_DETAIL.replace(":id", product._id)} className="font-semibold text-gray-900 dark:text-white hover:text-primary line-clamp-2">{product.name}</Link>
          <RatingStars rating={product.avgRating} />        <div className="flex items-center justify-between mt-3">
          <span className="font-bold">{formatPrice(product.discountPrice ?? product.price)}</span>
          <Button size="sm" onClick={handleAdd} disabled={!product.stock || product.stock <= 0}>Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
