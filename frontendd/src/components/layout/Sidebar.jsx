import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiPackage,
  FiUser,
} from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();

  const links = [
    {
      name: "Home",
      path: "/",
      icon: <FiHome />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <FiShoppingBag />,
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: <FiHeart />,
    },
    {
      name: "Cart",
      path: "/cart",
      icon: <FiShoppingCart />,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: <FiPackage />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <FiUser />,
    },
  ];

  return (
    <aside className="hidden h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600">
          ShopEase
        </h2>
      </div>

      <nav className="px-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition ${
              location.pathname === link.path
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;