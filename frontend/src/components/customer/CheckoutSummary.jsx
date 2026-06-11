import { useCart }     from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
const CheckoutSummary = () => {
  const { items, subtotal } = useCart();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
      <h3 className="font-bold mb-4">Order Items ({items.length})</h3>
      {items.map((item) => (
        <div key={item._id} className="flex justify-between text-sm py-2 border-b dark:border-gray-700">
          <span>{item.product?.name} × {item.quantity}</span>
          <span>{formatPrice(item.lineTotal)}</span>
        </div>
      ))}
      <div className="flex justify-between font-bold mt-4"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
    </div>
  );
};
export default CheckoutSummary;
