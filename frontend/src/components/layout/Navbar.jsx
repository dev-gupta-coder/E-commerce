import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import DarkModeToggle from "@/components/common/DarkModeToggle";

const Navbar = () => {
  const { isAuth, logout } = useAuth();
  const { itemCount }      = useCart();
  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link to={ROUTES.HOME} className="text-xl font-bold text-primary">ShopEase</Link>
      <div className="flex items-center gap-4">
        <Link to={ROUTES.PRODUCTS}>Products</Link>
        {isAuth ? (
          <>
            <Link to={ROUTES.CART}>Cart {itemCount > 0 && <span className="ml-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{itemCount}</span>}</Link>
            <Link to={ROUTES.WISHLIST}>Wishlist</Link>
            <Link to={ROUTES.ORDERS}>Orders</Link>
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN}>Login</Link>
            <Link to={ROUTES.REGISTER}>Register</Link>
          </>
        )}
        <DarkModeToggle />
      </div>
    </nav>
  );
};
export default Navbar;
