import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
} from "react-icons/fi";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useSelector((state) => state.auth || {});
  const cartItems = useSelector((state) => state.cart?.items || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            ShopEase
          </Link>

          <div className="hidden flex-1 md:flex md:max-w-xl">
            <div className="relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-11 pr-4 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              to="/wishlist"
              className="relative text-gray-700 dark:text-gray-200"
            >
              <FiHeart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative text-gray-700 dark:text-gray-200"
            >
              <FiShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700">
                  <FiUser />
                  <span>{user.name}</span>
                </button>

                <div className="invisible absolute right-0 mt-2 w-48 rounded-lg bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-gray-800">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Orders
                  </Link>

                  <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 dark:text-white md:hidden"
          >
            {mobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-700 md:hidden">
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-11 pr-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/cart">Cart</Link>

              {user ? (
                <>
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">Orders</Link>
                  <button className="text-left">Logout</button>
                </>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;