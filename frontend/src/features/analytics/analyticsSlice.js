import { createSlice } from "@reduxjs/toolkit";
import { fetchAnalyticsThunk } from "./analyticsThunks";

const initialState = { data: null, loading: false, error: null };

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsThunk.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalyticsThunk.fulfilled, (state, { payload }) => { state.loading = false; state.data = payload; })
      .addCase(fetchAnalyticsThunk.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export default analyticsSlice.reducer;
