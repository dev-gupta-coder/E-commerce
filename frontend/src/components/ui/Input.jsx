const Input = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <input className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary ${error ? "border-red-500" : "border-gray-300"} ${className}`} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
export default Input;
