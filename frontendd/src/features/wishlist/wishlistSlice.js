import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWishlistAPI,
  addWishlistAPI,
  removeWishlistAPI,
} from "./wishlistAPI";
import { addCartItem } from "../cart/cartSlice";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      return await getWishlistAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (payload, { rejectWithValue }) => {
    try {
      return await addWishlistAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add wishlist item"
      );
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId, { rejectWithValue }) => {
    try {
      await removeWishlistAPI(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove wishlist item"
      );
    }
  }
);

export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async (product, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(
        addCartItem({
          productId: product._id,
          quantity: 1,
        })
      ).unwrap();

      await dispatch(removeWishlistItem(product._id)).unwrap();

      return product;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;

        const wishlist =
          action.payload?.data?.wishlist ||
          action.payload?.wishlist ||
          action.payload?.data ||
          [];

        state.items = wishlist;
        state.totalItems = wishlist.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWishlistItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => {
          const id = item.product?._id || item._id;
          return id !== action.payload;
        });

        state.totalItems = state.items.length;
      })

      .addCase(moveToCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => {
          const id = item.product?._id || item._id;
          return id !== action.payload._id;
        });

        state.totalItems = state.items.length;
      });
  },
});

export default wishlistSlice.reducer;