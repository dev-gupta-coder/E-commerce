import { SORT_OPTIONS } from "@/constants/app.constants";

const CATEGORIES = ["Electronics","Clothing","Footwear","Home & Kitchen","Beauty & Personal Care","Sports & Fitness","Books","Toys & Games","Automotive","Groceries","Other"];

const ProductFilters = ({ filters, onChange }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  return (
    <aside className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Sort By</h3>
        <select value={filters.sort ?? ""} onChange={(e) => set("sort", e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Default</option>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="category" value="" checked={!filters.category} onChange={() => set("category", "")} className="accent-primary" />
            All Categories
          </label>
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="category" value={c} checked={filters.category === c} onChange={() => set("category", c)} className="accent-primary" />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice ?? ""} onChange={(e) => set("minPrice", e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="number" placeholder="Max" value={filters.maxPrice ?? ""} onChange={(e) => set("maxPrice", e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
          <input type="checkbox" checked={filters.inStock === "true"} onChange={(e) => set("inStock", e.target.checked ? "true" : "")} className="accent-primary" />
          In Stock Only
        </label>
      </div>
      <button onClick={() => onChange({})} className="text-sm text-primary hover:underline">Clear Filters</button>
    </aside>
  );
};
export default ProductFilters;
