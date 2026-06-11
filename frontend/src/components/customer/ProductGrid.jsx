import ProductCard from "./ProductCard";
import Skeleton    from "@/components/ui/Skeleton";
const ProductGrid = ({ products = [], loading = false }) => {
  if (loading) return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>;
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>;
};
export default ProductGrid;
