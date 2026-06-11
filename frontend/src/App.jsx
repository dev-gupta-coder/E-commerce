// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import AppRouter from "./routes/AppRouter";
// import { getMeThunk } from "@/features/auth/authThunks";
// import { getAccessToken } from "@/utils/tokenHelpers";

// const App = () => {
//   const dispatch = useDispatch();
//   useEffect(() => { if (getAccessToken()) dispatch(getMeThunk()); }, [dispatch]);
//   return <AppRouter />;
// };

// export default App;
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./routes/AppRouter";
import { initAuthThunk } from "@/features/auth/authThunks";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initAuthThunk());
  }, [dispatch]);

  return <AppRouter />;
};

export default App;