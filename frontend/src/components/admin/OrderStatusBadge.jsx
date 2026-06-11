import Badge from "@/components/ui/Badge";
const colorMap = { pending: "warning", confirmed: "info", packed: "info", shipped: "info", delivered: "success", cancelled: "danger" };
const OrderStatusBadge = ({ status }) => (
  <Badge color={colorMap[status] ?? "default"} className="capitalize">{status}</Badge>
);
export default OrderStatusBadge;
