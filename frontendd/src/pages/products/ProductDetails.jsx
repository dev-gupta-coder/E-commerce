import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import ProductGallery from "../../components/product/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductCard from "../../components/product/ProductCard";
import ReviewSection from "../../components/product/ReviewSection";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(
          `/products/${id}`
        );

        const productData =
          response.data?.data?.product ||
          response.data?.product;

        setProduct(productData);

        if (productData?.category) {
          const relatedResponse =
            await axiosClient.get("/products");

          const allProducts =
            relatedResponse.data?.data?.products ||
            relatedResponse.data?.products ||
            [];

          const related = allProducts
            .filter(
              (item) =>
                item._id !== productData._id &&
                item.category === productData.category
            )
            .slice(0, 4);

          setRelatedProducts(related);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    toast.success("Added to cart");
  };

  const handleAddToWishlist = () => {
    toast.success("Added to wishlist");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="animate-pulse">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[500px] rounded-xl bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-4">
              <div className="h-10 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-6 w-40 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-8 w-32 rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-32 rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Product Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} />

          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        </div>

        <ReviewSection
          reviews={product.reviews || []}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-3xl font-bold dark:text-white">
              Related Products
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;