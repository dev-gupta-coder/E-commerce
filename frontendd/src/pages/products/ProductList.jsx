import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import ProductGrid from "../../components/product/ProductGrid";
import ProductFilter from "../../components/product/ProductFilter";

const PRODUCTS_PER_PAGE = 12;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    maxPrice: "",
    sort: "",
  });

  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(
          "/products"
        );

        const productsData =
          response.data?.data?.products ||
          response.data?.products ||
          response.data?.data ||
          [];

        setProducts(productsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (filters.search) {
      data = data.filter((product) =>
        product.name
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      data = data.filter(
        (product) =>
          product.category === filters.category
      );
    }

    if (filters.maxPrice) {
      data = data.filter(
        (product) =>
          Number(
            product.discountPrice || product.price
          ) <= Number(filters.maxPrice)
      );
    }

    switch (filters.sort) {
      case "price_asc":
        data.sort(
          (a, b) =>
            (a.discountPrice || a.price) -
            (b.discountPrice || b.price)
        );
        break;

      case "price_desc":
        data.sort(
          (a, b) =>
            (b.discountPrice || b.price) -
            (a.discountPrice || a.price)
        );
        break;

      case "rating_desc":
        data.sort(
          (a, b) =>
            (b.avgRating || 0) -
            (a.avgRating || 0)
        );
        break;

      default:
        break;
    }

    return data;
  }, [products, filters]);

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
            className="w-full rounded-xl border p-4 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ProductFilter
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />

          <div>
            <ProductGrid
              products={paginatedProducts}
              loading={loading}
            />

            {!loading && totalPages > 1 && (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[...Array(totalPages)].map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setPage(index + 1)
                      }
                      className={`rounded-lg px-4 py-2 ${
                        page === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 dark:text-white"
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;