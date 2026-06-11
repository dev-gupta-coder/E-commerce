import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsThunk }       from "@/features/products/productThunks";
import { selectProducts, selectProductsLoading } from "@/features/products/productSelectors";
import ProductGrid      from "@/components/customer/ProductGrid";
import PageTitle        from "@/components/common/PageTitle";
import { Link }         from "react-router-dom";
import { ROUTES }       from "@/constants/routes.constants";

const HomePage = () => {
  const dispatch  = useDispatch();
  const products  = useSelector(selectProducts);
  const loading   = useSelector(selectProductsLoading);

  useEffect(() => { dispatch(fetchProductsThunk({ limit: 8, sortBy: "newest" })); }, [dispatch]);

  return (
    <>
      <PageTitle title="Home" />
      <section className="py-10 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-10 px-6">
        <h1 className="text-4xl font-bold mb-3">Shop Everything You Love</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Discover curated products at the best prices, delivered to your door.</p>
        <Link to={ROUTES.PRODUCTS} className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">Browse Products</Link>
      </section>
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New Arrivals</h2>
          <Link to={ROUTES.PRODUCTS} className="text-primary text-sm hover:underline">View All →</Link>
        </div>
        <ProductGrid products={products} loading={loading} />
      </section>
    </>
  );
};
export default HomePage;
