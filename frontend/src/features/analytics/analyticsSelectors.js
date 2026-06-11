export const selectAnalytics        = (state) => state.analytics.data;
export const selectAnalyticsSummary = (state) => state.analytics.data?.summary;
export const selectRevenueByMonth   = (state) => state.analytics.data?.revenueByMonth ?? [];
export const selectTopProducts      = (state) => state.analytics.data?.topProducts ?? [];
export const selectOrdersByStatus   = (state) => state.analytics.data?.ordersByStatus ?? [];
export const selectAnalyticsLoading = (state) => state.analytics.loading;
