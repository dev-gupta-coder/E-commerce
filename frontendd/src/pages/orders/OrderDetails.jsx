import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderDetails,
} from "../../features/orders/orderSlice";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline";

const OrderDetails = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    currentOrder,
    loading,
  } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading Order...
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                Order #{currentOrder._id}
              </h1>

              <p className="mt-2 text-gray-500">
                {new Date(
                  currentOrder.createdAt
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="font-semibold dark:text-white">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-medium ${
                  currentOrder.paymentStatus ===
                  "Paid"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {currentOrder.paymentStatus}
              </span>
            </div>
          </div>

          <OrderStatusTimeline
            currentStatus={
              currentOrder.orderStatus
            }
          />

          <div className="mt-10">
            <h2 className="mb-5 text-xl font-semibold dark:text-white">
              Ordered Items
            </h2>

            <div className="space-y-4">
              {currentOrder.items?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-700"
                >
                  <img
                    src={
                      item.product?.images?.[0]
                        ?.url ||
                      item.product?.images?.[0]
                    }
                    alt={
                      item.product?.name
                    }
                    className="h-20 w-20 rounded object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">
                      {
                        item.product?.name
                      }
                    </h3>

                    <p className="text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-blue-600">
                    ₹{item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t pt-6 dark:border-gray-700">
            <div className="flex justify-between text-xl font-bold dark:text-white">
              <span>Total</span>

              <span>
                ₹
                {
                  currentOrder.totalAmount
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;