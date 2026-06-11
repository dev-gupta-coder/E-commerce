import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
const CartSummary = () => {
  const { subtotal, isCheckoutReady } = useCart();
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>
      <div className="flex justify-between mb-2"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      <div className="flex justify-between mb-4 text-green-600"><span>Shipping</span><span>Free</span></div>
      <div className="flex justify-between font-bold text-lg border-t pt-4 dark:border-gray-700"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
      <Button className="w-full mt-4" disabled={!isCheckoutReady} onClick={() => navigate(ROUTES.CHECKOUT)}>Proceed to Checkout</Button>
    </div>
  );
};
export default CartSummary;
