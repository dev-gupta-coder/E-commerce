import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrdersThunk }      from "@/features/orders/orderThunks";
import { selectOrders, selectOrderPagination, selectOrderLoading } from "@/features/orders/orderSelectors";
import OrdersTable      from "@/components/admin/OrdersTable";
import Pagination       from "@/components/ui/Pagination";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import { usePagination } from "@/hooks/usePagination";

const AdminOrdersPage = () => {
  const dispatch   = useDispatch();
  const orders     = useSelector(selectOrders);
  const pagination = useSelector(selectOrderPagination);
  const loading    = useSelector(selectOrderLoading);
  const { page, setPage } = usePagination();

  useEffect(() => { dispatch(fetchAllOrdersThunk({ page, limit: 15 })); }, [dispatch, page]);

  return (
    <>
      <PageTitle title="Orders · Admin" />
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading ? <div className="flex justify-center py-20"><Spinner /></div>
        : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <OrdersTable orders={orders} />
            </div>
            <Pagination currentPage={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} />
          </>
        )
      }
    </>
  );
};
export default AdminOrdersPage;
