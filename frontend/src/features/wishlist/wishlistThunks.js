import { createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "@/services/wishlist.service";

export const fetchWishlistThunk      = createAsyncThunk("wishlist/fetch",  async (_, { rejectWithValue }) => { try { return (await wishlistService.getWishlist()).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const addToWishlistThunk      = createAsyncThunk("wishlist/add",    async (productId, { rejectWithValue }) => { try { return (await wishlistService.addItem(productId)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const removeFromWishlistThunk = createAsyncThunk("wishlist/remove", async (productId, { rejectWithValue }) => { try { return (await wishlistService.removeItem(productId)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
