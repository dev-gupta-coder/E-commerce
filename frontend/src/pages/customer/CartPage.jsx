import { useEffect }    from "react";
import { useCart }      from "@/hooks/useCart";
import CartItem         from "@/components/customer/CartItem";
import CartSummary      from "@/components/customer/CartSummary";
import EmptyState       from "@/components/ui/EmptyState";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import { Link }         from "react-router-dom";
import { ROUTES }       from "@/constants/routes.constants";
import Button           from "@/components/ui/Button";

const CartPage = () => {
  const { cart, items, fetchCart } = useCart();
  useEffect(() => { fetchCart(); }, []);

  if (!cart) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <PageTitle title="Cart" />
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      {items.length === 0
        ? <EmptyState title="Your cart is empty" description="Add some products to get started." action={<Button><Link to={ROUTES.PRODUCTS}>Browse Products</Link></Button>} />
        : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => <CartItem key={item._id} item={item} />)}
            </div>
            <div><CartSummary /></div>
          </div>
        )
      }
    </>
  );
};
export default CartPage;
