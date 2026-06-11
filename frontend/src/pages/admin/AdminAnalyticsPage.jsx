import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalyticsThunk }      from "@/features/analytics/analyticsThunks";
import { selectAnalytics, selectAnalyticsLoading, selectOrdersByStatus } from "@/features/analytics/analyticsSelectors";
import StatCard         from "@/components/admin/StatCard";
import RevenueChart     from "@/components/admin/RevenueChart";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import { formatPrice }  from "@/utils/formatPrice";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#2563eb","#16a34a","#d97706","#dc2626","#7c3aed","#0891b2"];

const AdminAnalyticsPage = () => {
  const dispatch       = useDispatch();
  const analytics      = useSelector(selectAnalytics);
  const ordersByStatus = useSelector(selectOrdersByStatus);
  const loading        = useSelector(selectAnalyticsLoading);

  useEffect(() => { dispatch(fetchAnalyticsThunk()); }, [dispatch]);

  if (loading || !analytics) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { summary, revenueByMonth } = analytics;

  return (
    <>
      <PageTitle title="Analytics · Admin" />
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue"   value={formatPrice(summary.totalRevenue)}  icon="💰" color="green" />
        <StatCard title="Paid Orders"     value={summary.paidOrders}                 icon="✅" color="blue" />
        <StatCard title="Total Products"  value={summary.totalProducts}              icon="🛍️" color="purple" />
        <StatCard title="Total Customers" value={summary.totalCustomers}             icon="👥" color="orange" />
      </div>
      <div className="grid xl:grid-cols-2 gap-6">
        <RevenueChart data={revenueByMonth} />
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
export default AdminAnalyticsPage;
