import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const image =
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder-product.png";

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg dark:bg-gray-800">
      <Link to={`/products/${product._id}`}>
        <img
          src={image}
          alt={product.name}
          className="h-60 w-full object-cover"
        />
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <FaStar className="text-yellow-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {product.avgRating || 0}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-xl font-bold text-blue-600">
                ₹{product.discountPrice}
              </span>

              <span className="text-sm text-gray-500 line-through">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              ₹{product.price}
            </span>
          )}
        </div>

        <div className="mt-3">
          <span
            className={`text-sm font-medium ${
              product.stock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;