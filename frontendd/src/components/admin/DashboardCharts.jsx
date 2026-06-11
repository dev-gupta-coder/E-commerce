import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardCharts = ({
  totalOrders,
  totalRevenue,
  totalProducts,
}) => {
  const statsData = [
    {
      name: "Orders",
      value: totalOrders,
    },
    {
      name: "Products",
      value: totalProducts,
    },
  ];

  const revenueData = [
    {
      name: "Revenue",
      value: totalRevenue,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-80 rounded-xl bg-white p-4 shadow dark:bg-gray-800">
        <ResponsiveContainer>
          <BarChart data={statsData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-80 rounded-xl bg-white p-4 shadow dark:bg-gray-800">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={revenueData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              <Cell />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;