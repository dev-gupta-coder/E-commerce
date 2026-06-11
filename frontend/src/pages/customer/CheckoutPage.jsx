import { useState }     from "react";
import { useDispatch }  from "react-redux";
import { useNavigate }  from "react-router-dom";
import { createOrderThunk } from "@/features/orders/orderThunks";
import { useCart }      from "@/hooks/useCart";
import { useToast }     from "@/hooks/useToast";
import { ROUTES }       from "@/constants/routes.constants";
import AddressForm      from "@/components/customer/AddressForm";
import CheckoutSummary  from "@/components/customer/CheckoutSummary";
import RazorpayButton   from "@/components/customer/RazorpayButton";
import PageTitle        from "@/components/common/PageTitle";
import { formatPrice }  from "@/utils/formatPrice";

const CheckoutPage = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const toast       = useToast();
  const { subtotal, clearCart } = useCart();
  const [step, setStep]     = useState(1);
  const [address, setAddress] = useState(null);
  const [method, setMethod]  = useState("razorpay");
  const [order, setOrder]    = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddressSubmit = (addr) => { setAddress(addr); setStep(2); };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const result = await dispatch(createOrderThunk({ shippingAddress: address, paymentMethod: method })).unwrap();
      setOrder(result.order);
      if (method === "cod") { clearCart(); navigate(ROUTES.PAYMENT_SUCCESS); }
      else setStep(3);
    } catch (err) { toast.error(err ?? "Order placement failed."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageTitle title="Checkout" />
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <h2 className="font-bold mb-4">Delivery Address</h2>
              <AddressForm onSubmit={handleAddressSubmit} />
            </div>
          )}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <h2 className="font-bold mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {["razorpay","cod"].map((m) => (
                  <label key={m} className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary">
                    <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="accent-primary" />
                    <span className="font-medium capitalize">{m === "cod" ? "Cash on Delivery" : "Razorpay (Card / UPI / NetBanking)"}</span>
                  </label>
                ))}
              </div>
              <button onClick={handlePlaceOrder} disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50">
                {loading ? "Placing Order…" : `Place Order · ${formatPrice(subtotal)}`}
              </button>
            </div>
          )}
          {step === 3 && order && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 text-center">
              <h2 className="font-bold mb-4">Complete Payment</h2>
              <RazorpayButton orderId={order._id} amount={formatPrice(order.totalAmount)} onSuccess={() => { clearCart(); navigate(ROUTES.PAYMENT_SUCCESS); }} />
            </div>
          )}
        </div>
        <div><CheckoutSummary /></div>
      </div>
    </>
  );
};
export default CheckoutPage;
