import { createAsyncThunk } from "@reduxjs/toolkit";
import { analyticsService } from "@/services/analytics.service";

export const fetchAnalyticsThunk = createAsyncThunk("analytics/fetch", async (_, { rejectWithValue }) => {
  try { return (await analyticsService.getDashboard()).data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
