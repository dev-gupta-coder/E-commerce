import { createSlice } from "@reduxjs/toolkit";
import { fetchCartThunk, addToCartThunk, updateCartItemThunk, removeCartItemThunk, clearCartThunk } from "./cartThunks";

const initialState = { cart: null, loading: false, error: null };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const fulfilled = (state, { payload }) => { state.loading = false; state.cart = payload; };
    const pending   = (state)              => { state.loading = true; state.error = null; };
    const rejected  = (state, { payload }) => { state.loading = false; state.error = payload; };
    builder
      .addCase(fetchCartThunk.pending,        pending)
      .addCase(fetchCartThunk.fulfilled,      fulfilled)
      .addCase(fetchCartThunk.rejected,       rejected)
      .addCase(addToCartThunk.pending,        pending)
      .addCase(addToCartThunk.fulfilled,      fulfilled)
      .addCase(addToCartThunk.rejected,       rejected)
      .addCase(updateCartItemThunk.fulfilled, fulfilled)
      .addCase(removeCartItemThunk.fulfilled, fulfilled)
      .addCase(clearCartThunk.fulfilled,      fulfilled)
      .addCase(clearCartThunk.rejected,       rejected);
  },
});

export default cartSlice.reducer;
