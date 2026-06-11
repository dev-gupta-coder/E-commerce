// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { authService } from "@/services/auth.service";
// import { setAccessToken, clearAccessToken } from "@/utils/tokenHelpers";

// export const loginThunk = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
//   try {
//     const res = await authService.login(data);
//     setAccessToken(res.data.data.accessToken);
//     return res.data.data;
//   } catch (err) { return rejectWithValue(err.response?.data?.message ?? "Login failed"); }
// });

// export const registerThunk = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
//   try { return (await authService.register(data)).data.data; }
//   catch (err) { return rejectWithValue(err.response?.data?.message ?? "Registration failed"); }
// });

// export const logoutThunk = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
//   try { await authService.logout(); clearAccessToken(); }
//   catch (err) { return rejectWithValue(err.response?.data?.message); }
// });

// export const getMeThunk = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
//   try { return (await authService.getMe()).data.data; }
//   catch (err) { return rejectWithValue(err.response?.data?.message); }
// });

// by codex chatgpt

import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { setAccessToken, clearAccessToken } from "@/utils/tokenHelpers";

const getError = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);

      if (response?.accessToken) {
        setAccessToken(response.accessToken);
      }

      return response;
    } catch (err) {
      return rejectWithValue(getError(err, "Login failed"));
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (err) {
      return rejectWithValue(getError(err, "Registration failed"));
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      clearAccessToken();
      return true;
    } catch (err) {
      return rejectWithValue(getError(err, "Logout failed"));
    }
  }
);

export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to get profile"));
    }
  }
);

export const initAuthThunk = createAsyncThunk(
  "auth/init",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (err) {
      return rejectWithValue(getError(err, "Auth initialization failed"));
    }
  }
);