import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  return (
    <div className="flex gap-4 py-4 border-b dark:border-gray-700">
      <img src={item.product?.image?.url ?? "/placeholder.png"} alt={item.product?.name} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-1">
        <p className="font-semibold">{item.product?.name}</p>
        <p className="text-sm text-gray-400">{formatPrice(item.priceAtAddition)} each</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => updateItem(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 rounded border flex items-center justify-center disabled:opacity-40">-</button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button onClick={() => updateItem(item._id, item.quantity + 1)} className="w-7 h-7 rounded border flex items-center justify-center">+</button>
          <button onClick={() => removeItem(item._id)} className="ml-4 text-red-500 text-sm">Remove</button>
        </div>
      </div>
      <p className="font-bold">{formatPrice(item.lineTotal)}</p>
    </div>
  );
};
export default CartItem;
