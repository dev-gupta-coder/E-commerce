import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";

const ProductInfo = ({
  product,
  onAddToCart,
  onAddToWishlist,
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {product?.name}
      </h1>

      <div className="mt-3 flex items-center gap-2">
        <FaStar className="text-yellow-400" />
        <span className="font-medium dark:text-white">
          {product?.avgRating || 0}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        {product?.discountPrice ? (
          <>
            <span className="text-3xl font-bold text-blue-600">
              ₹{product.discountPrice}
            </span>

            <span className="text-xl text-gray-500 line-through">
              ₹{product.price}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-blue-600">
            ₹{product.price}
          </span>
        )}
      </div>

      <p className="mt-5 text-gray-600 dark:text-gray-300">
        {product?.description}
      </p>

      <div className="mt-5">
        <span
          className={`font-semibold ${
            product?.stock > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {product?.stock > 0
            ? `${product.stock} In Stock`
            : "Out Of Stock"}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          <FaShoppingCart />
          Add To Cart
        </button>

        <button
          onClick={onAddToWishlist}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 dark:border-gray-700 dark:text-white"
        >
          <FaHeart />
          Add To Wishlist
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;