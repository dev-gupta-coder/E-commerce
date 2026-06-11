import { Link }    from "react-router-dom";
import { ROUTES }  from "@/constants/routes.constants";
import PageTitle   from "@/components/common/PageTitle";
import Button      from "@/components/ui/Button";

const PaymentSuccessPage = () => (
  <>
    <PageTitle title="Payment Successful" />
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-4xl">✅</div>
      <h1 className="text-3xl font-bold">Order Placed!</h1>
      <p className="text-gray-500 max-w-sm">Your order has been placed successfully. You'll receive a confirmation shortly.</p>
      <div className="flex gap-3 mt-4">
        <Button><Link to={ROUTES.ORDERS}>View My Orders</Link></Button>
        <Button variant="outline"><Link to={ROUTES.HOME}>Continue Shopping</Link></Button>
      </div>
    </div>
  </>
);
export default PaymentSuccessPage;
