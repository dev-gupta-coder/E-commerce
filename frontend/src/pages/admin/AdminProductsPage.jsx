import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk }       from "@/features/products/productThunks";
import { selectProducts, selectPagination, selectProductsLoading } from "@/features/products/productSelectors";
import ProductsTable    from "@/components/admin/ProductsTable";
import Pagination       from "@/components/ui/Pagination";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import Button           from "@/components/ui/Button";
import { Link }         from "react-router-dom";
import { ROUTES }       from "@/constants/routes.constants";
import { usePagination } from "@/hooks/usePagination";

const AdminProductsPage = () => {
  const dispatch   = useDispatch();
  const products   = useSelector(selectProducts);
  const pagination = useSelector(selectPagination);
  const loading    = useSelector(selectProductsLoading);
  const { page, setPage } = usePagination();

  useEffect(() => { dispatch(fetchProductsThunk({ page, limit: 15 })); }, [dispatch, page]);

  return (
    <>
      <PageTitle title="Products · Admin" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button><Link to={ROUTES.ADMIN_PRODUCT_FORM}>+ Add Product</Link></Button>
      </div>
      {loading ? <div className="flex justify-center py-20"><Spinner /></div>
        : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
              <ProductsTable products={products} />
            </div>
            <Pagination currentPage={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} />
          </>
        )
      }
    </>
  );
};
export default AdminProductsPage;
