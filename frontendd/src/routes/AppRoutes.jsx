import { Routes, Route } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/register" element={<div>Register</div>} />
      <Route path="/products/:id" element={<div>Product Details</div>} />
      <Route path="/cart" element={<div>Cart</div>} />
      <Route path="/wishlist" element={<div>Wishlist</div>} />
      <Route path="/checkout" element={<div>Checkout</div>} />
      <Route path="/orders" element={<div>Orders</div>} />
      <Route path="/profile" element={<div>Profile</div>} />

      <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      <Route path="/admin/products" element={<div>Admin Products</div>} />
      <Route path="/admin/orders" element={<div>Admin Orders</div>} />

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;