import { useEffect }    from "react";
// import { useDispatch }  from "react-redux";
// import { useSelector }  from "react-redux";
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { User }         from "@/services/auth.service";
import CustomersTable   from "@/components/admin/CustomersTable";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import api              from "@/services/axios.instance";
import { useState }     from "react";
import { usePagination } from "@/hooks/usePagination";
import Pagination       from "@/components/ui/Pagination";

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const { page, setPage, limit }  = usePagination();

  useEffect(() => {
    setLoading(true);
    api.get("/admin/customers", { params: { page, limit } })
      .then((res) => { setCustomers(res.data.data.customers); setTotal(res.data.data.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <>
      <PageTitle title="Customers · Admin" />
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      {loading ? <div className="flex justify-center py-20"><Spinner /></div>
        : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <CustomersTable customers={customers} />
            </div>
            <Pagination currentPage={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} />
          </>
        )
      }
    </>
  );
};
export default AdminCustomersPage;
