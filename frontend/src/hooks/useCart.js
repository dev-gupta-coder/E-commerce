// import { useSelector, useDispatch } from "react-redux";
// import { selectCart, selectCartItems, selectCartSubtotal, selectCartItemCount } from "@/features/cart/cartSelectors";
// import { addToCartThunk, updateCartItemThunk, removeCartItemThunk, clearCartThunk, fetchCartThunk } from "@/features/cart/cartThunks";

// export const useCart = () => {
//   const dispatch   = useDispatch();
//   const cart       = useSelector(selectCart);
//   const items      = useSelector(selectCartItems);
//   const subtotal   = useSelector(selectCartSubtotal);
//   const itemCount  = useSelector(selectCartItemCount);
//   return { cart, items, subtotal, itemCount, fetchCart: () => dispatch(fetchCartThunk()), addItem: (data) => dispatch(addToCartThunk(data)), updateItem: (id, qty) => dispatch(updateCartItemThunk({ id, quantity: qty })), removeItem: (id) => dispatch(removeCartItemThunk(id)), clearCart: () => dispatch(clearCartThunk()) };
// };

import { useSelector, useDispatch } from "react-redux";
import {
  selectCart,
  selectCartItems,
  selectCartSubtotal,
  selectCartItemCount,
  selectIsCheckoutReady,
} from "@/features/cart/cartSelectors";
import {
  addToCartThunk,
  updateCartItemThunk,
  removeCartItemThunk,
  clearCartThunk,
  fetchCartThunk,
} from "@/features/cart/cartThunks";

export const useCart = () => {
  const dispatch = useDispatch();

  return {
    cart: useSelector(selectCart),
    items: useSelector(selectCartItems),
    subtotal: useSelector(selectCartSubtotal),
    itemCount: useSelector(selectCartItemCount),
    isCheckoutReady: useSelector(selectIsCheckoutReady),

    fetchCart: () => dispatch(fetchCartThunk()).unwrap(),
    addItem: (data) => dispatch(addToCartThunk(data)).unwrap(),
    updateItem: (id, qty) => dispatch(updateCartItemThunk({ id, quantity: qty })).unwrap(),
    removeItem: (id) => dispatch(removeCartItemThunk(id)).unwrap(),
    clearCart: () => dispatch(clearCartThunk()).unwrap(),
  };
};