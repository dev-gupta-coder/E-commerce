// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { cartService } from "@/services/cart.service";

// export const fetchCartThunk      = createAsyncThunk("cart/fetch",  async (_, { rejectWithValue }) => { try { return (await cartService.getCart()).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const addToCartThunk      = createAsyncThunk("cart/add",    async (data, { rejectWithValue }) => { try { return (await cartService.addItem(data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const updateCartItemThunk = createAsyncThunk("cart/update", async ({ id, quantity }, { rejectWithValue }) => { try { return (await cartService.updateItem(id, { quantity })).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const removeCartItemThunk = createAsyncThunk("cart/remove", async (id, { rejectWithValue }) => { try { return (await cartService.removeItem(id)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const clearCartThunk      = createAsyncThunk("cart/clear",  async (_, { rejectWithValue }) => { try { await cartService.clearCart(); } catch (err) { return rejectWithValue(err.response?.data?.message); } });

// by codex chatgpt
import { createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "@/services/cart.service";

const emptyCart = {
  _id: null,
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  isCheckoutReady: false,
};

const getError = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

export const fetchCartThunk = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    return await cartService.getCart();
  } catch (err) {
    return rejectWithValue(getError(err, "Failed to fetch cart"));
  }
});

export const addToCartThunk = createAsyncThunk("cart/add", async (data, { rejectWithValue }) => {
  try {
    return await cartService.addItem(data);
  } catch (err) {
    return rejectWithValue(getError(err, "Failed to add item"));
  }
});

export const updateCartItemThunk = createAsyncThunk("cart/update", async ({ id, quantity }, { rejectWithValue }) => {
  try {
    return await cartService.updateItem(id, { quantity });
  } catch (err) {
    return rejectWithValue(getError(err, "Failed to update cart item"));
  }
});

export const removeCartItemThunk = createAsyncThunk("cart/remove", async (id, { rejectWithValue }) => {
  try {
    return await cartService.removeItem(id);
  } catch (err) {
    return rejectWithValue(getError(err, "Failed to remove item"));
  }
});

export const clearCartThunk = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await cartService.clearCart();
    return emptyCart;
  } catch (err) {
    return rejectWithValue(getError(err, "Failed to clear cart"));
  }
});