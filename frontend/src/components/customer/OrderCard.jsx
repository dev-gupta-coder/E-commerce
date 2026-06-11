import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { formatDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import Badge from "@/components/ui/Badge";
const statusColor = { pending: "warning", confirmed: "info", packed: "info", shipped: "info", delivered: "success", cancelled: "danger" };
const OrderCard = ({ order }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
      <Badge color={statusColor[order.orderStatus]}>{order.orderStatus}</Badge>
    </div>
    <p className="text-sm text-gray-500 mb-3">{formatDate(order.createdAt)}</p>
    <div className="flex items-center justify-between">
      <p className="font-bold">{formatPrice(order.totalAmount)}</p>
      <Link to={ROUTES.ORDER_DETAIL.replace(":id", order._id)} className="text-primary text-sm font-medium hover:underline">View Details →</Link>
    </div>
  </div>
);
export default OrderCard;
