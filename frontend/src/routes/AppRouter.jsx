import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute     from "./AdminRoute";
import GuestRoute     from "./GuestRoute";
import { AuthPages, CustomerPages, AdminPages } from "./routeConfig";
import CustomerLayout from "@/components/layout/CustomerLayout";
import AdminLayout    from "@/components/layout/AdminLayout";
import AuthLayout     from "@/components/layout/AuthLayout";
import Spinner        from "@/components/ui/Spinner";

const AppRouter = () => (
  <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN}    element={<AuthPages.Login />} />
          <Route path={ROUTES.REGISTER} element={<AuthPages.Register />} />
        </Route>
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path={ROUTES.HOME}           element={<CustomerPages.Home />} />
        <Route path={ROUTES.PRODUCTS}       element={<CustomerPages.Products />} />
        <Route path={ROUTES.PRODUCT_DETAIL} element={<CustomerPages.ProductDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.CART}            element={<CustomerPages.Cart />} />
          <Route path={ROUTES.WISHLIST}        element={<CustomerPages.Wishlist />} />
          <Route path={ROUTES.CHECKOUT}        element={<CustomerPages.Checkout />} />
          <Route path={ROUTES.ORDERS}          element={<CustomerPages.Orders />} />
          <Route path={ROUTES.ORDER_DETAIL}    element={<CustomerPages.OrderDetail />} />
          <Route path={ROUTES.PROFILE}         element={<CustomerPages.Profile />} />
          <Route path={ROUTES.PAYMENT_SUCCESS} element={<CustomerPages.PaymentSuccess />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD}    element={<AdminPages.Dashboard />} />
          <Route path={ROUTES.ADMIN_PRODUCTS}     element={<AdminPages.Products />} />
          <Route path={ROUTES.ADMIN_PRODUCT_FORM} element={<AdminPages.ProductForm />} />
          <Route path={ROUTES.ADMIN_PRODUCT_EDIT} element={<AdminPages.ProductForm />} />
          <Route path={ROUTES.ADMIN_ORDERS}       element={<AdminPages.Orders />} />
          <Route path={ROUTES.ADMIN_ORDER_DETAIL} element={<AdminPages.OrderDetail />} />
          <Route path={ROUTES.ADMIN_CUSTOMERS}    element={<AdminPages.Customers />} />
          <Route path={ROUTES.ADMIN_ANALYTICS}    element={<AdminPages.Analytics />} />
        </Route>
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<CustomerPages.NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
