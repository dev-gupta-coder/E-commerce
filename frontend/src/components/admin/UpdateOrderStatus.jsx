import { useState }            from "react";
import { useDispatch }         from "react-redux";
import { updateOrderStatusThunk } from "@/features/orders/orderThunks";
import { ORDER_STATUSES }      from "@/constants/app.constants";
import { useToast }            from "@/hooks/useToast";

const UpdateOrderStatus = ({ orderId, currentStatus }) => {
  const dispatch = useDispatch();
  const toast    = useToast();
  const [status, setStatus] = useState(currentStatus);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await dispatch(updateOrderStatusThunk({ id: orderId, data: { orderStatus: newStatus } })).unwrap();
      toast.success("Order status updated.");
    } catch (err) {
      toast.error(err ?? "Update failed.");
      setStatus(currentStatus);
    }
  };

  return (
    <select value={status} onChange={handleChange} className="text-xs px-2 py-1 rounded border dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary">
      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
};
export default UpdateOrderStatus;
