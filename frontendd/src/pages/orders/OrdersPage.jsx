import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../features/orders/orderSlice";

const OrdersPage = () => {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold dark:text-white">
          Order History
        </h1>

        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl bg-white p-5 shadow dark:bg-gray-800"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold dark:text-white">
                    Order #{order._id}
                  </h3>

                  <p className="mt-2 text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>

                  <p className="mt-2 text-blue-600 font-bold">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <div>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      order.orderStatus ===
                      "Delivered"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;