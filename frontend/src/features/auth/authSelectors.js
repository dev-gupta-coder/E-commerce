export const selectUser         = (state) => state.auth.user;
export const selectAccessToken  = (state) => state.auth.accessToken;
export const selectIsAuth       = (state) => Boolean(state.auth.user);
// export const selectIsAdmin      = (state) => state.auth.user?.role === "admin";
export const selectIsAdmin      = (state) => state.auth.user?.role === "owner";
export const selectAuthLoading  = (state) => state.auth.loading;
export const selectAuthError    = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;