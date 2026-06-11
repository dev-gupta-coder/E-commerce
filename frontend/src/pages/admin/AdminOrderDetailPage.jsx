import { useEffect }    from "react";
import { useParams }    from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderByIdThunk }      from "@/features/orders/orderThunks";
import { selectOrder, selectOrderLoading } from "@/features/orders/orderSelectors";
import { formatDate }   from "@/utils/formatDate";
import { formatPrice }  from "@/utils/formatPrice";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import UpdateOrderStatus from "@/components/admin/UpdateOrderStatus";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";

const AdminOrderDetailPage = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const order    = useSelector(selectOrder);
  const loading  = useSelector(selectOrderLoading);

  useEffect(() => { dispatch(fetchOrderByIdThunk(id)); }, [dispatch, id]);

  if (loading || !order) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <PageTitle title={`Order #${order._id.slice(-8).toUpperCase()}`} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.orderStatus} />
          <UpdateOrderStatus orderId={order._id} currentStatus={order.orderStatus} />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-3 py-3 border-b dark:border-gray-700 last:border-0">
              <img src={item.product?.images?.[0]?.url ?? "/placeholder.png"} className="w-14 h-14 rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product?.name}</p>
                <p className="text-xs text-gray-400">{item.quantity} × {formatPrice(item.priceAtAddition)}</p>
              </div>
              <p className="font-semibold text-sm">{formatPrice(item.priceAtAddition * item.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4 pt-3 border-t dark:border-gray-700"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <h2 className="font-semibold mb-3">Customer</h2>
            <p className="text-sm">{order.user?.name}</p>
            <p className="text-sm text-gray-400 font-mono">{order.user?.mobile}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <h2 className="font-semibold mb-3">Shipping</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <h2 className="font-semibold mb-3">Payment</h2>
            <p className="text-sm capitalize">{order.paymentMethod} · <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-500"}>{order.paymentStatus}</span></p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>
    </>
  );
};
export default AdminOrderDetailPage;
