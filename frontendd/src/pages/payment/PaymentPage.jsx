import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RazorpayButton from "../../components/payment/RazorpayButton";
import axiosClient from "../../api/axiosClient";

const PaymentPage = () => {
  const location = useLocation();

  const [checkoutData, setCheckoutData] =
    useState({
      amount: 0,
      user: {},
    });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      try {
        const cartResponse =
          await axiosClient.get("/cart");

        const cart =
          cartResponse.data?.data?.cart ||
          cartResponse.data?.cart ||
          {};

        const items = cart.items || [];

        const totalAmount = items.reduce(
          (total, item) => {
            const product =
              item.product || item;

            return (
              total +
              (product.discountPrice ||
                product.price ||
                0) *
                item.quantity
            );
          },
          0
        );

        const userResponse =
          await axiosClient.get("/auth/me");

        const user =
          userResponse.data?.data?.user ||
          userResponse.data?.user ||
          {};

        setCheckoutData({
          amount: totalAmount,
          user,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [location]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading Payment Details...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Payment
          </h1>

          <div className="mb-8 rounded-xl bg-gray-100 p-5 dark:bg-gray-700">
            <div className="flex justify-between">
              <span className="font-medium dark:text-white">
                Total Amount
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ₹{checkoutData.amount}
              </span>
            </div>
          </div>

          <RazorpayButton
            amount={checkoutData.amount}
            orderData={{
              name: checkoutData.user?.name,
              email: checkoutData.user?.email,
              mobile:
                checkoutData.user?.mobileNumber,
            }}
            buttonText="Pay Now"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;