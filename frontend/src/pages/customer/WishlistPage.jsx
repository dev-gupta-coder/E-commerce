import { useEffect }    from "react";
import { useWishlist }  from "@/hooks/useWishlist";
import WishlistCard     from "@/components/customer/WishlistCard";
import EmptyState       from "@/components/ui/EmptyState";
import PageTitle        from "@/components/common/PageTitle";
import { Link }         from "react-router-dom";
import { ROUTES }       from "@/constants/routes.constants";
import Button           from "@/components/ui/Button";

const WishlistPage = () => {
  const { products, fetch } = useWishlist();
  useEffect(() => { fetch(); }, []);

  return (
    <>
      <PageTitle title="Wishlist" />
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({products.length})</h1>
      {products.length === 0
        ? <EmptyState title="Your wishlist is empty" description="Save products you love." action={<Button><Link to={ROUTES.PRODUCTS}>Browse Products</Link></Button>} />
        : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{products.map((p) => <WishlistCard key={p._id} product={p} />)}</div>
      }
    </>
  );
};
export default WishlistPage;
