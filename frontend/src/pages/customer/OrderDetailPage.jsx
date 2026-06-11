import { useEffect }    from "react";
import { useParams }    from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderByIdThunk }      from "@/features/orders/orderThunks";
import { selectOrder, selectOrderLoading } from "@/features/orders/orderSelectors";
import { formatDate }   from "@/utils/formatDate";
import { formatPrice }  from "@/utils/formatPrice";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";

const OrderDetailPage = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const order    = useSelector(selectOrder);
  const loading  = useSelector(selectOrderLoading);

  useEffect(() => { dispatch(fetchOrderByIdThunk(id)); }, [dispatch, id]);

  if (loading || !order) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <PageTitle title={`Order #${order._id.slice(-8).toUpperCase()}`} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 mb-4">
          <h2 className="font-semibold mb-4">Items</h2>
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-4 py-3 border-b dark:border-gray-700 last:border-0">
              <img src={item.product?.images?.[0]?.url ?? "/placeholder.png"} alt={item.product?.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-sm text-gray-400">Qty: {item.quantity} × {formatPrice(item.priceAtAddition)}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.priceAtAddition * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 mb-4">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Placed on</span><span>{formatDate(order.createdAt)}</span></div>
          <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Payment</span><span className="capitalize">{order.paymentMethod} · {order.paymentStatus}</span></div>
          <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-3 mt-2"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>
    </>
  );
};
export default OrderDetailPage;
