import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartAPI,
  addCartItemAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI,
} from "./cartAPI";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      return await getCartAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch cart"
      );
    }
  }
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (payload, { rejectWithValue }) => {
    try {
      return await addCartItemAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to add item"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateCartItemAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update item"
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      await removeCartItemAPI(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to remove item"
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await clearCartAPI();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to clear cart"
      );
    }
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

const calculateTotals = (items) => {
  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalAmount = items.reduce(
    (acc, item) =>
      acc +
      (item.price || item.discountPrice || 0) *
        item.quantity,
    0
  );

  return {
    totalItems,
    totalAmount,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;

        const cart =
          action.payload?.data?.cart ||
          action.payload?.cart ||
          {};

        state.items = cart.items || [];

        const totals = calculateTotals(
          state.items
        );

        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCartItem.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(updateCartItem.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item._id !== action.payload
        );

        const totals = calculateTotals(
          state.items
        );

        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
      });
  },
});

export default cartSlice.reducer;