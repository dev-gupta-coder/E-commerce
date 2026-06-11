import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);

        const [cartResponse, addressResponse] = await Promise.all([
          axiosClient.get("/cart"),
          axiosClient.get("/address"),
        ]);

        const cartData =
          cartResponse.data?.data?.cart ||
          cartResponse.data?.cart ||
          {};

        const addressData =
          addressResponse.data?.data?.addresses ||
          addressResponse.data?.addresses ||
          [];

        setCart(cartData);
        setAddresses(addressData);

        const defaultAddress = addressData.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (addressData.length > 0) {
          setSelectedAddress(addressData[0]._id);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load checkout data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, []);

  const orderSummary = useMemo(() => {
    const items = cart?.items || [];

    const subtotal = items.reduce((total, item) => {
      const product = item.product || item;

      return (
        total +
        (product.discountPrice || product.price || 0) *
          item.quantity
      );
    }, 0);

    const shippingCharge = subtotal > 999 ? 0 : 99;

    const totalAmount = subtotal + shippingCharge;

    const totalItems = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    return {
      subtotal,
      shippingCharge,
      totalAmount,
      totalItems,
    };
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    try {
      setPlacingOrder(true);

      const payload = {
        addressId: selectedAddress,
      };

      const response = await axiosClient.post(
        "/orders",
        payload
      );

      const order =
        response.data?.data?.order ||
        response.data?.order;

      toast.success(
        response.data?.message ||
          "Order placed successfully"
      );

      navigate(`/orders/${order?._id || ""}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-lg font-semibold">
          Loading Checkout...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-5 text-xl font-semibold dark:text-white">
                Select Delivery Address
              </h2>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center dark:text-white">
                    No address found. Please add an address first.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`block cursor-pointer rounded-xl border p-4 transition ${
                        selectedAddress === address._id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address._id}
                        checked={
                          selectedAddress === address._id
                        }
                        onChange={() =>
                          setSelectedAddress(address._id)
                        }
                        className="hidden"
                      />

                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold dark:text-white">
                            {address.fullName}
                          </h3>

                          {address.isDefault && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          {address.addressLine}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.city}, {address.state}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.pincode}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.mobile}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="mb-5 text-xl font-semibold dark:text-white">
                Shipping Details
              </h2>

              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  • Standard Delivery: 3 - 5 Business Days
                </p>
                <p>
                  • Free Shipping on Orders Above ₹999
                </p>
                <p>
                  • Secure Packaging & Tracking Included
                </p>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold dark:text-white">
              Order Summary
            </h2>

            <div className="space-y-4">
              {(cart?.items || []).map((item) => {
                const product = item.product || item;

                return (
                  <div
                    key={item._id}
                    className="flex justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-medium dark:text-white">
                        {product.name}
                      </h4>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="font-semibold dark:text-white">
                      ₹
                      {(product.discountPrice ||
                        product.price) *
                        item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="my-6 border-t pt-6 dark:border-gray-700">
              <div className="mb-3 flex justify-between">
                <span className="dark:text-white">
                  Total Items
                </span>

                <span className="dark:text-white">
                  {orderSummary.totalItems}
                </span>
              </div>

              <div className="mb-3 flex justify-between">
                <span className="dark:text-white">
                  Subtotal
                </span>

                <span className="dark:text-white">
                  ₹{orderSummary.subtotal}
                </span>
              </div>

              <div className="mb-3 flex justify-between">
                <span className="dark:text-white">
                  Shipping
                </span>

                <span className="dark:text-white">
                  {orderSummary.shippingCharge === 0
                    ? "Free"
                    : `₹${orderSummary.shippingCharge}`}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4 text-xl font-bold dark:border-gray-700 dark:text-white">
                <span>Total</span>
                <span>₹{orderSummary.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                !selectedAddress ||
                !cart?.items?.length
              }
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;