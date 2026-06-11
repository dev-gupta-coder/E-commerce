const EmptyState = ({ title = "Nothing here", description = "", action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <p className="text-4xl">🛒</p>
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="text-sm text-gray-500">{description}</p>}
    {action}
  </div>
);
export default EmptyState;
