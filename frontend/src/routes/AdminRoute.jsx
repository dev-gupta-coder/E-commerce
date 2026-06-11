// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectIsAuth, selectIsAdmin } from "@/features/auth/authSelectors";
// import { ROUTES } from "@/constants/routes.constants";

// const AdminRoute = () => {
//   const isAuth  = useSelector(selectIsAuth);
//   const isAdmin = useSelector(selectIsAdmin);
//   if (!isAuth)  return <Navigate to={ROUTES.LOGIN} replace />;
//   if (!isAdmin) return <Navigate to={ROUTES.HOME}  replace />;
//   return <Outlet />;
// };
// export default AdminRoute;

// by codex chatgpt
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuth,
  selectIsAdmin,
  selectAuthInitialized,
} from "@/features/auth/authSelectors";
import { ROUTES } from "@/constants/routes.constants";
import Spinner from "@/components/ui/Spinner";

const AdminRoute = () => {
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const initialized = useSelector(selectAuthInitialized);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuth) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isAdmin) return <Navigate to={ROUTES.HOME} replace />;

  return <Outlet />;
};

export default AdminRoute;