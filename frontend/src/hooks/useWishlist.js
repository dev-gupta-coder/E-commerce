import { useSelector, useDispatch } from "react-redux";
import { selectWishlistProducts, selectWishlistCount } from "@/features/wishlist/wishlistSelectors";
import { fetchWishlistThunk, addToWishlistThunk, removeFromWishlistThunk } from "@/features/wishlist/wishlistThunks";

export const useWishlist = () => {
  const dispatch  = useDispatch();
  const products  = useSelector(selectWishlistProducts);
  const count     = useSelector(selectWishlistCount);
  return { products, count, fetch: () => dispatch(fetchWishlistThunk()), add: (id) => dispatch(addToWishlistThunk(id)), remove: (id) => dispatch(removeFromWishlistThunk(id)) };
};
