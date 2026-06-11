// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { productService } from "@/services/product.service";

// export const fetchProductsThunk    = createAsyncThunk("products/fetchAll", async (params, { rejectWithValue }) => { try { return (await productService.getAll(params)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const searchProductsThunk   = createAsyncThunk("products/search",   async (params, { rejectWithValue }) => { try { return (await productService.search(params)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const fetchProductByIdThunk = createAsyncThunk("products/fetchOne", async (id, { rejectWithValue }) => { try { return (await productService.getById(id)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const createProductThunk    = createAsyncThunk("products/create",   async (data, { rejectWithValue }) => { try { return (await productService.create(data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const updateProductThunk    = createAsyncThunk("products/update",   async ({ id, data }, { rejectWithValue }) => { try { return (await productService.update(id, data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const deleteProductThunk    = createAsyncThunk("products/delete",   async (id, { rejectWithValue }) => { try { await productService.delete(id); return id; } catch (err) { return rejectWithValue(err.response?.data?.message); } });

// by codex chatgpt
import { createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/services/product.service";

const getError = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await productService.getAll(params);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to fetch products"));
    }
  }
);

export const searchProductsThunk = createAsyncThunk(
  "products/search",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await productService.search(params);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to search products"));
    }
  }
);

export const fetchProductByIdThunk = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.getById(id);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to fetch product"));
    }
  }
);

// by gpt
export const createProductThunk = createAsyncThunk(
  "products/create",
  async (data, { rejectWithValue }) => {
    try {
      return await productService.create(data);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to create product"));
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await productService.update(id, data);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to update product"));
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await productService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to delete product"));
    }
  }
);