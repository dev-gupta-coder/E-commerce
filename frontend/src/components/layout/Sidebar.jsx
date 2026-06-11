import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

const links = [
  { to: ROUTES.ADMIN_DASHBOARD,  label: "Dashboard" },
  { to: ROUTES.ADMIN_PRODUCTS,   label: "Products" },
  { to: ROUTES.ADMIN_ORDERS,     label: "Orders" },
  { to: ROUTES.ADMIN_CUSTOMERS,  label: "Customers" },
  { to: ROUTES.ADMIN_ANALYTICS,  label: "Analytics" },
];

const Sidebar = () => (
  <aside className="w-56 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col py-6 px-4 gap-2">
    <p className="text-lg font-bold mb-4 text-primary">Admin</p>
    {links.map(({ to, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        {label}
      </NavLink>
    ))}
  </aside>
);
export default Sidebar;
