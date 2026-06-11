import { createSlice } from "@reduxjs/toolkit";
import { fetchWishlistThunk, addToWishlistThunk, removeFromWishlistThunk } from "./wishlistThunks";

const initialState = { products: [], count: 0, loading: false, error: null };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const fulfilled = (state, { payload }) => { state.loading = false; state.products = payload.products; state.count = payload.count; };
    builder
      .addCase(fetchWishlistThunk.pending,        (state) => { state.loading = true; })
      .addCase(fetchWishlistThunk.fulfilled,      fulfilled)
      .addCase(fetchWishlistThunk.rejected,       (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(addToWishlistThunk.fulfilled,      fulfilled)
      .addCase(removeFromWishlistThunk.fulfilled, fulfilled);
  },
});

export default wishlistSlice.reducer;
