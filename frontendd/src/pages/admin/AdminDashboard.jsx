import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, ordersRes] =
          await Promise.all([
            axiosClient.get("/products"),
            axiosClient.get("/orders"),
          ]);

        const products =
          productsRes.data?.data?.products ||
          productsRes.data?.products ||
          [];

        const orders =
          ordersRes.data?.data?.orders ||
          ordersRes.data?.orders ||
          [];

        const revenue = orders.reduce(
          (total, order) =>
            total + (order.totalAmount || 0),
          0
        );

        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold dark:text-white">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-gray-500">
            Total Products
          </h2>

          <p className="mt-3 text-4xl font-bold text-blue-600">
            {stats.products}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-gray-500">
            Total Orders
          </h2>

          <p className="mt-3 text-4xl font-bold text-green-600">
            {stats.orders}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-gray-500">
            Total Revenue
          </h2>

          <p className="mt-3 text-4xl font-bold text-purple-600">
            ₹{stats.revenue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;