import { useCallback } from "react";
import { paymentService } from "@/services/payment.service";
import Button from "@/components/ui/Button";
import { RAZORPAY_KEY } from "@/constants/app.constants";
import { useToast } from "@/hooks/useToast";

const RazorpayButton = ({ orderId, amount, onSuccess }) => {
  const toast = useToast();
  const handlePay = useCallback(async () => {
    try {
      const { data } = await paymentService.createOrder({ orderId });
      const options = {
        key:     RAZORPAY_KEY,
        amount:  data.data.amount,
        currency:data.data.currency,
        order_id:data.data.razorpayOrderId,
        handler: async (response) => {
          await paymentService.verifyPayment({ ...response, orderId });
          toast.success("Payment successful!");
          onSuccess?.();
        },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Payment failed. Please try again."); }
  }, [orderId, onSuccess, toast]);
  return <Button onClick={handlePay} className="w-full">Pay {amount}</Button>;
};
export default RazorpayButton;
