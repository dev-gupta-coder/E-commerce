import { createSlice } from "@reduxjs/toolkit";
import { fetchMyOrdersThunk, fetchOrderByIdThunk, createOrderThunk } from "./orderThunks";

const initialState = { orders: [], order: null, pagination: null, loading: false, error: null };

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: { clearOrder: (state) => { state.order = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrdersThunk.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyOrdersThunk.fulfilled, (state, { payload }) => { state.loading = false; state.orders = payload.orders; state.pagination = payload.pagination; })
      .addCase(fetchMyOrdersThunk.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchOrderByIdThunk.fulfilled,(state, { payload }) => { state.order = payload.order; })
      .addCase(createOrderThunk.pending,     (state) => { state.loading = true; })
      .addCase(createOrderThunk.fulfilled,   (state, { payload }) => { state.loading = false; state.order = payload.order; })
      .addCase(createOrderThunk.rejected,    (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
