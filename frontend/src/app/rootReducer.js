import { combineReducers } from "@reduxjs/toolkit";
import authReducer      from "@/features/auth/authSlice";
import cartReducer      from "@/features/cart/cartSlice";
import wishlistReducer  from "@/features/wishlist/wishlistSlice";
import productReducer   from "@/features/products/productSlice";
import orderReducer     from "@/features/orders/orderSlice";
import reviewReducer    from "@/features/reviews/reviewSlice";
import analyticsReducer from "@/features/analytics/analyticsSlice";

const rootReducer = combineReducers({
  auth:      authReducer,
  cart:      cartReducer,
  wishlist:  wishlistReducer,
  products:  productReducer,
  orders:    orderReducer,
  reviews:   reviewReducer,
  analytics: analyticsReducer,
});

export default rootReducer;
