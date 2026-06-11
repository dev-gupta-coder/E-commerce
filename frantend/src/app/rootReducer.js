import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../../../frontendd/src/features/auth/authSlice";
import productReducer from "../features/product/productSlice";
import cartReducer from "../../../frontendd/src/features/cart/cartSlice";
import wishlistReducer from "../../../frontendd/src/features/wishlist/wishlistSlice";
import orderReducer from "../features/order/orderSlice";
import themeReducer from "../features/theme/themeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer,
  theme: themeReducer,
});

export default rootReducer;