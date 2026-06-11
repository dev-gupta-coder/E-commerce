import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { paiseToRupees } from "@/utils/formatPrice";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const RevenueChart = ({ data = [] }) => {
  const chartData = [...data].reverse().map((d) => ({
    name:    `${MONTHS[d.month - 1]} ${d.year}`,
    revenue: paiseToRupees(d.revenue),
    orders:  d.orders,
  }));
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
      <h3 className="font-semibold mb-4">Revenue (Last 12 Months)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default RevenueChart;
