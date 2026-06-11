import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-blue-600">
              ShopEase
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Premium ecommerce experience with quality products and fast delivery.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2">
              <Link to="/">Home</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/wishlist">Wishlist</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Customer
            </h3>

            <div className="flex flex-col gap-2">
              <Link to="/orders">Orders</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Contact
            </h3>

            <p className="text-gray-600 dark:text-gray-400">
              support@shopease.com
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-gray-600 dark:border-gray-800 dark:text-gray-400">
          © 2026 ShopEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;