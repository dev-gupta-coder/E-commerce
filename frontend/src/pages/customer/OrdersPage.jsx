import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrdersThunk }       from "@/features/orders/orderThunks";
import { selectOrders, selectOrderPagination, selectOrderLoading } from "@/features/orders/orderSelectors";
import OrderCard        from "@/components/customer/OrderCard";
import EmptyState       from "@/components/ui/EmptyState";
import Spinner          from "@/components/ui/Spinner";
import Pagination       from "@/components/ui/Pagination";
import PageTitle        from "@/components/common/PageTitle";
import { usePagination } from "@/hooks/usePagination";

const OrdersPage = () => {
  const dispatch   = useDispatch();
  const orders     = useSelector(selectOrders);
  const pagination = useSelector(selectOrderPagination);
  const loading    = useSelector(selectOrderLoading);
  const { page, setPage } = usePagination();

  useEffect(() => { dispatch(fetchMyOrdersThunk({ page })); }, [dispatch, page]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <PageTitle title="My Orders" />
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0
        ? <EmptyState title="No orders yet" description="Your placed orders will appear here." />
        : (
          <>
            <div className="space-y-4">{orders.map((o) => <OrderCard key={o._id} order={o} />)}</div>
            <Pagination currentPage={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} />
          </>
        )
      }
    </>
  );
};
export default OrdersPage;
