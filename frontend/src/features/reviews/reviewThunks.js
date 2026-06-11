// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { reviewService } from "@/services/review.service";

// export const fetchReviewsThunk = createAsyncThunk("reviews/fetch", async (productId, { rejectWithValue }) => { try { return (await reviewService.getReviews(productId)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
// export const addReviewThunk    = createAsyncThunk("reviews/add",   async ({ productId, data }, { rejectWithValue }) => { try { return (await reviewService.addReview(productId, data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });

// by codex chatgpt
import { createAsyncThunk } from "@reduxjs/toolkit";
import { reviewService } from "@/services/review.service";

const getError = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

export const addReviewThunk = createAsyncThunk(
  "reviews/add",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      return await reviewService.addReview(productId, data);
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to add review"));
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  "reviews/delete",
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(productId, reviewId);
      return { productId, reviewId };
    } catch (err) {
      return rejectWithValue(getError(err, "Failed to delete review"));
    }
  }
);