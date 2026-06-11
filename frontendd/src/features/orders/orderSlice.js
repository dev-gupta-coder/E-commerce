import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getOrdersAPI,
  getOrderByIdAPI,
} from "./orderAPI";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      return await getOrderByIdAPI(orderId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch order"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;

        state.orders =
          action.payload?.data?.orders ||
          action.payload?.orders ||
          [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchOrderDetails.fulfilled,
        (state, action) => {
          state.loading = false;

          state.currentOrder =
            action.payload?.data?.order ||
            action.payload?.order ||
            null;
        }
      )
      .addCase(
        fetchOrderDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default orderSlice.reducer;