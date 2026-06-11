import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchWishlist,
  removeWishlistItem,
  moveToCart,
} from "../../features/wishlist/wishlistSlice";

const WishlistPage = () => {
  const dispatch = useDispatch();

  const { items, loading } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(
        removeWishlistItem(productId)
      ).unwrap();

      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      await dispatch(moveToCart(product)).unwrap();

      toast.success("Moved to cart");
    } catch (error) {
      toast.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading Wishlist...
        </h2>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold dark:text-white">
          Your Wishlist Is Empty
        </h2>

        <Link
          to="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold dark:text-white">
          My Wishlist
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const product = item.product || item;

            const image =
              product?.images?.[0]?.url ||
              product?.images?.[0] ||
              "/placeholder-product.png";

            return (
              <div
                key={product._id}
                className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800"
              >
                <Link to={`/products/${product._id}`}>
                  <img
                    src={image}
                    alt={product.name}
                    className="h-64 w-full object-cover"
                  />
                </Link>

                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="line-clamp-2 text-lg font-semibold dark:text-white">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xl font-bold text-blue-600">
                    ₹
                    {product.discountPrice ||
                      product.price}
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        handleMoveToCart(product)
                      }
                      className="rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                    >
                      Move To Cart
                    </button>

                    <button
                      onClick={() =>
                        handleRemove(product._id)
                      }
                      className="rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;