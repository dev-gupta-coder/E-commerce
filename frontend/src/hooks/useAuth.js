// import { useSelector, useDispatch } from "react-redux";
// import { selectUser, selectIsAuth, selectIsAdmin, selectAuthLoading } from "@/features/auth/authSelectors";
// import { loginThunk, logoutThunk, getMeThunk } from "@/features/auth/authThunks";

// export const useAuth = () => {
//   const dispatch  = useDispatch();
//   const user      = useSelector(selectUser);
//   const isAuth    = useSelector(selectIsAuth);
//   const isAdmin   = useSelector(selectIsAdmin);
//   const loading   = useSelector(selectAuthLoading);
//   return { user, isAuth, isAdmin, loading, login: (data) => dispatch(loginThunk(data)), logout: () => dispatch(logoutThunk()), getMe: () => dispatch(getMeThunk()) };
// };

// by codex chatgpt
import { useSelector, useDispatch } from "react-redux";
import {
  selectUser,
  selectIsAuth,
  selectIsAdmin,
  selectAuthLoading,
} from "@/features/auth/authSelectors";
import { loginThunk, logoutThunk, getMeThunk } from "@/features/auth/authThunks";

export const useAuth = () => {
  const dispatch = useDispatch();

  return {
    user: useSelector(selectUser),
    isAuth: useSelector(selectIsAuth),
    isAdmin: useSelector(selectIsAdmin),
    loading: useSelector(selectAuthLoading),

    login: (data) => dispatch(loginThunk(data)).unwrap(),
    logout: () => dispatch(logoutThunk()).unwrap(),
    getMe: () => dispatch(getMeThunk()).unwrap(),
  };
};