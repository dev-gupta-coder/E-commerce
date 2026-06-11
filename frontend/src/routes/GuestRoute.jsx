// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { selectIsAuth } from "@/features/auth/authSelectors";
// import { ROUTES } from "@/constants/routes.constants";

// const GuestRoute = () => {
//   const isAuth = useSelector(selectIsAuth);
//   return isAuth ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
// };
// export default GuestRoute;

// by codex chatgpt
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuth,
  selectAuthInitialized,
} from "@/features/auth/authSelectors";
import { ROUTES } from "@/constants/routes.constants";
import Spinner from "@/components/ui/Spinner";

const GuestRoute = () => {
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectAuthInitialized);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return isAuth ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
};

export default GuestRoute;