import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response =
        await axiosClient.get("/orders");

      setOrders(
        response.data?.data?.orders ||
          response.data?.orders ||
          []
      );
    } catch {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      await axiosClient.patch(
        `/orders/${orderId}`,
        {
          orderStatus: status,
        }
      );

      toast.success(
        "Order status updated"
      );

      fetchOrders();
    } catch {
      toast.error(
        "Failed to update order"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold dark:text-white">
        Order Management
      </h1>

      <div className="overflow-x-auto rounded-xl bg-white shadow dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                Order ID
              </th>
              <th className="p-4 text-left">
                Amount
              </th>
              <th className="p-4 text-left">
                Status
              </th>
              <th className="p-4 text-left">
                Payment
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b"
              >
                <td className="p-4">
                  {order._id}
                </td>

                <td className="p-4">
                  ₹
                  {order.totalAmount}
                </td>

                <td className="p-4">
                  <select
                    value={
                      order.orderStatus
                    }
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                    className="rounded border p-2"
                  >
                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      order.paymentStatus ===
                      "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {
                      order.paymentStatus
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;