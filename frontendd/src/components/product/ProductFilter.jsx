const ProductFilter = ({
  filters,
  setFilters,
  categories,
}) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold dark:text-white">
        Filters
      </h2>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium dark:text-white">
            Category
          </label>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className="w-full rounded-lg border p-3 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-white">
            Max Price
          </label>

          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: e.target.value,
              }))
            }
            placeholder="Enter max price"
            className="w-full rounded-lg border p-3 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-white">
            Sort By
          </label>

          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value,
              }))
            }
            className="w-full rounded-lg border p-3 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Default</option>
            <option value="price_asc">
              Price Low To High
            </option>
            <option value="price_desc">
              Price High To Low
            </option>
            <option value="rating_desc">
              Highest Rated
            </option>
            <option value="latest">
              Latest
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;