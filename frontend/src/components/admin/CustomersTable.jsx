import { formatDate } from "@/utils/formatDate";
import Avatar         from "@/components/ui/Avatar";

const CustomersTable = ({ customers = [] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
          <th className="pb-3 font-medium">Customer</th>
          <th className="pb-3 font-medium">Mobile</th>
          <th className="pb-3 font-medium">Joined</th>
          <th className="pb-3 font-medium">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y dark:divide-gray-700">
        {customers.map((c) => (
          <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="py-3">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size="sm" />
                <span className="font-medium">{c.name}</span>
              </div>
            </td>
            <td className="py-3 text-gray-500 font-mono">{c.mobile}</td>
            <td className="py-3 text-gray-500">{formatDate(c.createdAt)}</td>
            <td className="py-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {c.isActive ? "Active" : "Suspended"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {customers.length === 0 && <p className="text-center text-gray-400 py-10">No customers found.</p>}
  </div>
);
export default CustomersTable;
