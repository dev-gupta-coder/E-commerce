export const selectCart          = (state) => state.cart.cart;
export const selectCartItems     = (state) => state.cart.cart?.items ?? [];
export const selectCartSubtotal  = (state) => state.cart.cart?.subtotal ?? 0;
export const selectCartItemCount = (state) => state.cart.cart?.itemCount ?? 0;
export const selectCartLoading   = (state) => state.cart.loading;
// export const selectIsCheckoutReady = (state) => state.cart.cart?.isCheckoutReady ?? false;
export const selectIsCheckoutReady = (state) =>
  Boolean(state.cart.cart?.isCheckoutReady);