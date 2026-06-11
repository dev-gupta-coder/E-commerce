import ProductCard from "./ProductCard";

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800"
          >
            <div className="h-60 bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-3 p-4">
              <div className="h-4 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-6 w-1/3 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow dark:bg-gray-800">
        <h2 className="text-xl font-semibold dark:text-white">
          No Products Found
        </h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;