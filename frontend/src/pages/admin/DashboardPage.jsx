import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalyticsThunk }      from "@/features/analytics/analyticsThunks";
import { selectAnalyticsSummary, selectRevenueByMonth, selectTopProducts, selectAnalyticsLoading } from "@/features/analytics/analyticsSelectors";
import StatCard         from "@/components/admin/StatCard";
import RevenueChart     from "@/components/admin/RevenueChart";
import Spinner          from "@/components/ui/Spinner";
import PageTitle        from "@/components/common/PageTitle";
import { formatPrice }  from "@/utils/formatPrice";

const DashboardPage = () => {
  const dispatch   = useDispatch();
  const summary    = useSelector(selectAnalyticsSummary);
  const revenue    = useSelector(selectRevenueByMonth);
  const top        = useSelector(selectTopProducts);
  const loading    = useSelector(selectAnalyticsLoading);

  useEffect(() => { dispatch(fetchAnalyticsThunk()); }, [dispatch]);

  if (loading || !summary) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <>
      <PageTitle title="Dashboard" />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue"   value={formatPrice(summary.totalRevenue)}  icon="💰" color="green" />
        <StatCard title="Total Orders"    value={summary.totalOrders}                icon="📦" color="blue" />
        <StatCard title="Products"        value={summary.totalProducts}              icon="🛍️" color="purple" />
        <StatCard title="Customers"       value={summary.totalCustomers}             icon="👥" color="orange" />
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><RevenueChart data={revenue} /></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {top.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={item.product?.images?.[0]?.url ?? "/placeholder.png"} className="w-9 h-9 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">{item.unitsSold} sold</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardPage;
