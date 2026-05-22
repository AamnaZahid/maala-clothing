import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export function ProductCard({ product, onAddToCart }) {
  const price = product.discountedPrice || product.effectivePrice || product.price;
  const outOfStock = product.stockQuantity === 0;
  const discountPct = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : null;

  return (
    <div className="card-shine group overflow-hidden rounded-2xl border border-[#E8D5A8]/40 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C9A962]/50 hover:shadow-xl hover:shadow-[#6B1D3A]/15">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#F3EBE4]">
          <img
            src={product.imageUrls?.[0] || '/logo.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4F1529]/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-gray-800">Out of Stock</span>
            </div>
          )}

          {discountPct && (
            <span className="absolute left-3 top-3 rounded-full bg-[#6B1D3A] px-2.5 py-1 text-xs font-bold text-[#E8D5A8]">
              -{discountPct}%
            </span>
          )}

          {product.isFeatured && !outOfStock && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#C9A962] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4F1529]">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        <div className="p-4">
          {product.categoryName && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#8B2E4E]/60">{product.categoryName}</p>
          )}
          <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-[#4F1529] md:text-base">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#6B1D3A]">{formatPrice(price)}</span>
            {product.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      {!outOfStock && onAddToCart && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6B1D3A] py-2.5 text-sm font-medium text-white transition hover:bg-[#4F1529]"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
