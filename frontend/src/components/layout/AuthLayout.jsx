import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <Outlet />
  </div>
);
export default AuthLayout;
