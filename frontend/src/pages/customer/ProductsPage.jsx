import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchProductsThunk }      from "@/features/products/productThunks";
import { selectProducts, selectPagination, selectProductsLoading } from "@/features/products/productSelectors";
import ProductGrid      from "@/components/customer/ProductGrid";
import ProductFilters   from "@/components/customer/ProductFilters";
import SearchBar        from "@/components/common/SearchBar";
import Pagination       from "@/components/ui/Pagination";
import PageTitle        from "@/components/common/PageTitle";
import { usePagination } from "@/hooks/usePagination";

const ProductsPage = () => {
  const dispatch    = useDispatch();
  const products    = useSelector(selectProducts);
  const pagination  = useSelector(selectPagination);
  const loading     = useSelector(selectProductsLoading);
  const { page, limit, setPage, reset } = usePagination();
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(searchProductsThunk({ ...filters, page, limit }));
  }, [dispatch, filters, page, limit]);

  const handleFilterChange = (f) => { setFilters(f); reset(); };

  return (
    <>
      <PageTitle title="Products" />
      <div className="mb-6"><SearchBar onSearch={(kw) => handleFilterChange({ ...filters, search: kw })} /></div>
      <div className="flex gap-8">
        <div className="w-56 flex-shrink-0 hidden md:block">
          <ProductFilters filters={filters} onChange={handleFilterChange} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">{pagination?.totalProducts ?? 0} products found</p>
          <ProductGrid products={products} loading={loading} />
          <Pagination currentPage={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
};
export default ProductsPage;
