export const selectWishlistProducts = (state) => state.wishlist.products;
export const selectWishlistCount    = (state) => state.wishlist.count;
export const selectWishlistLoading  = (state) => state.wishlist.loading;
export const selectIsInWishlist     = (productId) => (state) => state.wishlist.products.some((p) => p._id === productId);
