import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../features/cart/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();

  const {
    items,
    totalAmount,
    totalItems,
    loading,
  } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (
    itemId,
    quantity
  ) => {
    if (quantity < 1) return;

    try {
      await dispatch(
        updateCartItem({
          itemId,
          quantity,
        })
      ).unwrap();

      dispatch(fetchCart());
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(
        removeCartItem(itemId)
      ).unwrap();

      toast.success("Item removed");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();

      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-lg font-semibold">
          Loading Cart...
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold dark:text-white">
          Your Cart Is Empty
        </h2>

        <Link
          to="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {items.map((item) => {
              const product =
                item.product || item;

              const image =
                product?.images?.[0]?.url ||
                product?.images?.[0];

              return (
                <div
                  key={item._id}
                  className="rounded-xl bg-white p-4 shadow dark:bg-gray-800"
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    <img
                      src={image}
                      alt={product.name}
                      className="h-32 w-32 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold dark:text-white">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-blue-600 font-bold">
                        ₹
                        {product.discountPrice ||
                          product.price}
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.quantity - 1
                            )
                          }
                          className="rounded bg-gray-200 px-3 py-1"
                        >
                          -
                        </button>

                        <span className="dark:text-white">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              item.quantity + 1
                            )
                          }
                          className="rounded bg-gray-200 px-3 py-1"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveItem(item._id)
                      }
                      className="rounded-lg bg-red-500 px-4 py-2 text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-fit rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-5 text-2xl font-bold dark:text-white">
              Cart Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="dark:text-white">
                  Total Items
                </span>

                <span className="font-semibold dark:text-white">
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="dark:text-white">
                  Total Amount
                </span>

                <span className="font-semibold text-blue-600">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white"
            >
              Proceed To Checkout
            </Link>

            <button
              onClick={handleClearCart}
              className="mt-3 w-full rounded-lg bg-red-500 py-3 font-semibold text-white"
            >
              Empty Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartPage;