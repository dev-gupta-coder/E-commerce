import { createSlice } from "@reduxjs/toolkit";
import { fetchProductsThunk, fetchProductByIdThunk, searchProductsThunk } from "./productThunks";

const initialState = { products: [], product: null, pagination: null, facets: null, loading: false, error: null };

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: { clearProduct: (state) => { state.product = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductsThunk.fulfilled,  (state, { payload }) => { state.loading = false; state.products = payload.products; state.pagination = payload.pagination; })
      .addCase(fetchProductsThunk.rejected,   (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(searchProductsThunk.fulfilled, (state, { payload }) => { state.loading = false; state.products = payload.products; state.pagination = payload.pagination; state.facets = payload.facets; })
      .addCase(fetchProductByIdThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchProductByIdThunk.fulfilled,(state, { payload }) => { state.loading = false; state.product = payload.product; })
      .addCase(fetchProductByIdThunk.rejected,(state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
