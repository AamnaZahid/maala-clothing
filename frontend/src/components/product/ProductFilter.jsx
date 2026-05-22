export function ProductFilter({ categories, selectedCategory, onCategoryChange, sort, onSortChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-medium">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => onCategoryChange('')}
            />
            All
          </label>
          {(categories || []).map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === String(cat.id)}
                onChange={() => onCategoryChange(String(cat.id))}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-medium">Sort</h4>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
