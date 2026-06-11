import { lazy } from "react";

export const AuthPages = {
  Login:    lazy(() => import("@/pages/auth/LoginPage")),
  Register: lazy(() => import("@/pages/auth/RegisterPage")),
};

export const CustomerPages = {
  Home:          lazy(() => import("@/pages/customer/HomePage")),
  Products:      lazy(() => import("@/pages/customer/ProductsPage")),
  ProductDetail: lazy(() => import("@/pages/customer/ProductDetailPage")),
  Cart:          lazy(() => import("@/pages/customer/CartPage")),
  Wishlist:      lazy(() => import("@/pages/customer/WishlistPage")),
  Checkout:      lazy(() => import("@/pages/customer/CheckoutPage")),
  Orders:        lazy(() => import("@/pages/customer/OrdersPage")),
  OrderDetail:   lazy(() => import("@/pages/customer/OrderDetailPage")),
  Profile:       lazy(() => import("@/pages/customer/ProfilePage")),
  PaymentSuccess:lazy(() => import("@/pages/customer/PaymentSuccessPage")),
  NotFound:      lazy(() => import("@/pages/customer/NotFoundPage")),
};

export const AdminPages = {
  Dashboard:      lazy(() => import("@/pages/admin/DashboardPage")),
  Products:       lazy(() => import("@/pages/admin/AdminProductsPage")),
  ProductForm:    lazy(() => import("@/pages/admin/AdminProductFormPage")),
  Orders:         lazy(() => import("@/pages/admin/AdminOrdersPage")),
  OrderDetail:    lazy(() => import("@/pages/admin/AdminOrderDetailPage")),
  Customers:      lazy(() => import("@/pages/admin/AdminCustomersPage")),
  Analytics:      lazy(() => import("@/pages/admin/AdminAnalyticsPage")),
};
