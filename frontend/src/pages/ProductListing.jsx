import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addItem } = useCart();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, sort, page],
    queryFn: () =>
      productService.getProducts({
        category: category || undefined,
        search: search || undefined,
        sort,
        page,
        size: 12,
      }),
  });

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const handleAddToCart = (product) => {
    const size = product.sizes?.[0] || 'Free Size';
    const color = product.colors?.[0] || 'Default';
    addItem(product, size, color, 1);
    toast.success('Added to cart!');
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-medium">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() => updateParam('category', '')}
            />
            All
          </label>
          {(categories || []).map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                checked={category === String(cat.id)}
                onChange={() => updateParam('category', String(cat.id))}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="texture-bg">
      <div className="gradient-hero px-4 py-10 md:py-14">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#C9A962]">Our Collection</p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white">All Products</h1>
          <p className="mx-auto mt-3 max-w-lg text-[#E8D5A8]/80">Handpicked Pakistani lawn suits, kurtas and dupattas — stitched with care</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-[#4F1529] md:text-2xl">Browse Products</h2>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <Button variant="secondary" size="sm" className="md:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <FilterPanel />
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : !data?.content?.length ? (
            <EmptyState
              icon={Package}
              title="No products found"
              message="Try adjusting your filters or search term"
              actionLabel="View All Products"
              onAction={() => setSearchParams({})}
            />
          ) : (
            <>
              <ProductGrid products={data.content} onAddToCart={handleAddToCart} />
              {data.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={page === 0}
                    onClick={() => updateParam('page', String(page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {page + 1} of {data.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={data.last}
                    onClick={() => updateParam('page', String(page + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 max-h-[70vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6">
            <FilterPanel />
            <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>Apply Filters</Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
