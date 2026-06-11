const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colors = { blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20", green: "bg-green-50 text-green-600 dark:bg-green-900/20", purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20", orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20" };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {icon && <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};
export default StatCard;
