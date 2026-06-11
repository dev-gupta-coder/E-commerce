import { Link }             from "react-router-dom";
import { ROUTES }           from "@/constants/routes.constants";
import { formatDate }       from "@/utils/formatDate";
import { formatPrice }      from "@/utils/formatPrice";
import OrderStatusBadge     from "./OrderStatusBadge";
import UpdateOrderStatus    from "./UpdateOrderStatus";

const OrdersTable = ({ orders = [] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
          <th className="pb-3 font-medium">Order ID</th>
          <th className="pb-3 font-medium">Date</th>
          <th className="pb-3 font-medium">Amount</th>
          <th className="pb-3 font-medium">Payment</th>
          <th className="pb-3 font-medium">Status</th>
          <th className="pb-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y dark:divide-gray-700">
        {orders.map((order) => (
          <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="py-3">
              <Link to={ROUTES.ADMIN_ORDER_DETAIL.replace(":id", order._id)} className="text-primary hover:underline font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </Link>
            </td>
            <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
            <td className="py-3 font-semibold">{formatPrice(order.totalAmount)}</td>
            <td className="py-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {order.paymentStatus}
              </span>
            </td>
            <td className="py-3"><OrderStatusBadge status={order.orderStatus} /></td>
            <td className="py-3"><UpdateOrderStatus orderId={order._id} currentStatus={order.orderStatus} /></td>
          </tr>
        ))}
      </tbody>
    </table>
    {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders found.</p>}
  </div>
);
export default OrdersTable;
