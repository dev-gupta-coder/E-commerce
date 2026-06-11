import { useEffect, useState } from "react";
import { useParams }           from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductByIdThunk }    from "@/features/products/productThunks";
import {  addReviewThunk } from "@/features/reviews/reviewThunks";//fetchReviewsThunk,
import { selectProduct, selectProductsLoading } from "@/features/products/productSelectors";
import { selectReviews }            from "@/features/reviews/reviewSelectors";
import { selectIsAuth }             from "@/features/auth/authSelectors";
import { useCart }                  from "@/hooks/useCart";
import { useWishlist }              from "@/hooks/useWishlist";
import { useToast }                 from "@/hooks/useToast";
import PriceDisplay                 from "@/components/common/PriceDisplay";
import RatingStars                  from "@/components/ui/RatingStars";
import Button                       from "@/components/ui/Button";
import Spinner                      from "@/components/ui/Spinner";
import ReviewCard                   from "@/components/customer/ReviewCard";
import ReviewForm                   from "@/components/customer/ReviewForm";
import PageTitle                    from "@/components/common/PageTitle";

const ProductDetailPage = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const product    = useSelector(selectProduct);
  const loading    = useSelector(selectProductsLoading);
  const reviews    = useSelector(selectReviews);
  const isAuth     = useSelector(selectIsAuth);
  const { addItem }  = useCart();
  const { add, products: wishlist } = useWishlist();
  const toast      = useToast();
  const [qty, setQty] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => { dispatch(fetchProductByIdThunk(id)); dispatch(fetchReviewsThunk(id)); }, [dispatch, id]);

  if (loading || !product) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const handleAddToCart = async () => { try { await addItem({ productId: id, quantity: qty }); toast.success("Added to cart!"); } catch { toast.error("Failed to add to cart."); } };
  const handleAddReview = async (data) => { setReviewLoading(true); try { await dispatch(addReviewThunk({ productId: id, data })).unwrap(); toast.success("Review submitted!"); } catch (err) { toast.error(err ?? "Failed."); } finally { setReviewLoading(false); } };
  const inWishlist = wishlist.some((p) => p._id === id);

  return (
    <>
      <PageTitle title={product.name} />
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div className="space-y-3">
          <img src={product.images?.[0]?.url ?? "/placeholder.png"} alt={product.name} className="w-full rounded-2xl object-cover aspect-square" />
          <div className="flex gap-2">
            {product.images?.slice(1).map((img, i) => <img key={i} src={img.url} className="w-16 h-16 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-primary" />)}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">{product.category} · {product.brand}</p>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4"><RatingStars rating={product.avgRating} /><span className="text-sm text-gray-400">({product.numReviews} reviews)</span></div>
          <PriceDisplay price={product.price} discountPrice={product.discountPrice} className="mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{product.description}</p>
          <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border dark:border-gray-700 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">-</button>
              <span className="px-4 py-2 border-x dark:border-gray-700">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2">+</button>
            </div>
            <Button onClick={handleAddToCart} disabled={!product.stock} className="flex-1">Add to Cart</Button>
            <Button variant="outline" onClick={() => add(id)} disabled={inWishlist}>{inWishlist ? "Wishlisted ♥" : "Wishlist ♡"}</Button>
          </div>
        </div>
      </div>
      <section>
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
        {reviews.length === 0 && <p className="text-gray-400 text-sm mb-6">No reviews yet. Be the first!</p>}
        {isAuth && <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"><h3 className="font-semibold mb-4">Write a Review</h3><ReviewForm onSubmit={handleAddReview} loading={reviewLoading} /></div>}
      </section>
    </>
  );
};
export default ProductDetailPage;
