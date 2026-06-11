// import { createSlice } from "@reduxjs/toolkit";
// import { fetchReviewsThunk, addReviewThunk } from "./reviewThunks";

// const initialState = { reviews: [], loading: false, error: null };

// const reviewSlice = createSlice({
//   name: "reviews",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchReviewsThunk.fulfilled, (state, { payload }) => { state.reviews = payload; })
//       .addCase(addReviewThunk.fulfilled,    (state, { payload }) => { state.reviews.unshift(payload); });
//   },
// });

// export default reviewSlice.reducer;

// by codex chatgpt, added loading and error handling
import { createSlice } from "@reduxjs/toolkit";
import { addReviewThunk, deleteReviewThunk } from "./reviewThunks";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setReviews: (state, { payload }) => {
      state.reviews = payload ?? [];
    },
    clearReviews: (state) => {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReviewThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.reviews = payload.product?.reviews ?? state.reviews;
      })
      .addCase(addReviewThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(deleteReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== payload.reviewId);
      })
      .addCase(deleteReviewThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setReviews, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;