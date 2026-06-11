import { useWishlist } from "@/hooks/useWishlist";
import { useCart }     from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import { Link }        from "react-router-dom";
import { ROUTES }      from "@/constants/routes.constants";
const WishlistCard = ({ product }) => {
  const { remove }  = useWishlist();
  const { addItem } = useCart();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
      <Link to={ROUTES.PRODUCT_DETAIL.replace(":id", product._id)}><img src={product.images?.[0]?.url ?? "/placeholder.png"} alt={product.name} className="w-full h-40 object-cover" /></Link>
      <div className="p-4">
        <p className="font-semibold line-clamp-1">{product.name}</p>
        <p className="font-bold mt-1">{formatPrice(product.discountPrice ?? product.price)}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => addItem({ productId: product._id, quantity: 1 })} className="flex-1 py-1.5 text-sm bg-primary text-white rounded-lg">Add to Cart</button>
          <button onClick={() => remove(product._id)} className="px-3 py-1.5 text-sm text-red-500 border border-red-300 rounded-lg">Remove</button>
        </div>
      </div>
    </div>
  );
};
export default WishlistCard;
