// import { createSlice } from "@reduxjs/toolkit";
// import { loginThunk, registerThunk, logoutThunk, getMeThunk } from "./authThunks";

// const initialState = { user: null, accessToken: null, loading: false, error: null }; // by codex chatgpt, added initialized state
// // by codex chatgpt
// const initialState = {
//   user: null,
//   accessToken: null,
//   loading: false,
//   initialized: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, { payload }) => { state.user = payload.user; state.accessToken = payload.accessToken; },
//     clearCredentials: (state)            => { state.user = null; state.accessToken = null; },
//   },
//   extraReducers: (builder) => {
//     const pending  = (state)         => { state.loading = true;  state.error = null; };
//     const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
//     builder
//       .addCase(loginThunk.pending,    pending)
//       .addCase(loginThunk.rejected,   rejected)
//       .addCase(loginThunk.fulfilled,  (state, { payload }) => { state.loading = false; state.user = payload.user; state.accessToken = payload.accessToken; })
//       .addCase(registerThunk.pending, pending)
//       .addCase(registerThunk.rejected,rejected)
//       .addCase(registerThunk.fulfilled,(state) => { state.loading = false; })
//       .addCase(logoutThunk.fulfilled, (state) => { state.user = null; state.accessToken = null; })
//       .addCase(getMeThunk.fulfilled,  (state, { payload }) => { state.user = payload.user; });
//   },
// });

// export const { setCredentials, clearCredentials } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";
import {
  initAuthThunk,
  loginThunk,
  registerThunk,
  logoutThunk,
  getMeThunk,
} from "./authThunks";

const initialState = {
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(initAuthThunk.pending, pending)
      .addCase(initAuthThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.initialized = true;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
      })
      .addCase(initAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload;
      })

      .addCase(loginThunk.pending, pending)
      .addCase(loginThunk.rejected, rejected)
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.initialized = true;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
      })

      .addCase(registerThunk.pending, pending)
      .addCase(registerThunk.rejected, rejected)
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
      })

      .addCase(getMeThunk.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.accessToken = payload.accessToken;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;