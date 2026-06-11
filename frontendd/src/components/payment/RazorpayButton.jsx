import { useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const RazorpayButton = ({
  amount,
  orderData = {},
  buttonText = "Pay Now",
}) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        toast.error("Failed to load Razorpay");
        return;
      }

      const orderResponse = await axiosClient.post(
        "/payments/create-order",
        {
          amount,
          ...orderData,
        }
      );

      const razorpayOrder =
        orderResponse.data?.data ||
        orderResponse.data;

      const options = {
        key:
          import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency:
          razorpayOrder.currency || "INR",
        name: "Ecommerce Store",
        description: "Order Payment",
        order_id: razorpayOrder.id,

        handler: async (response) => {
          try {
            const verifyResponse =
              await axiosClient.post(
                "/payments/verify",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            const payment =
              verifyResponse.data?.data ||
              verifyResponse.data;

            toast.success(
              verifyResponse.data?.message ||
                "Payment Successful"
            );

            window.location.href = `/payment/success?paymentId=${
              payment?.paymentId ||
              response.razorpay_payment_id
            }`;
          } catch (error) {
            toast.error(
              error?.response?.data?.message ||
                "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },

        theme: {
          color: "#2563eb",
        },

        prefill: {
          name: orderData?.name || "",
          email: orderData?.email || "",
          contact: orderData?.mobile || "",
        },
      };

      const razorpay = new window.Razorpay(
        options
      );

      razorpay.open();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Payment initiation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Processing..." : buttonText}
    </button>
  );
};

export default RazorpayButton;