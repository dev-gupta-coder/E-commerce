// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectIsAuth } from "@/features/auth/authSelectors";
// import { ROUTES } from "@/constants/routes.constants";

// const ProtectedRoute = () => {
//   const isAuth = useSelector(selectIsAuth);
//   return isAuth ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
// };
// export default ProtectedRoute;

// by codex chatgpt
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuth,
  selectAuthInitialized,
} from "@/features/auth/authSelectors";
import { ROUTES } from "@/constants/routes.constants";
import Spinner from "@/components/ui/Spinner";

const ProtectedRoute = () => {
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectAuthInitialized);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return isAuth ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;