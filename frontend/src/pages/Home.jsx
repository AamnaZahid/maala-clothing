import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, CreditCard, Truck, Search, Star, Shield, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { asset } from '../utils/assetUrl';

export default function Home() {
  const { addItem } = useCart();

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: settingsService.getPublicSettings,
  });

  const { data: featured, isLoading: featuredLoading, isError: featuredError } = useQuery({
    queryKey: ['featured'],
    queryFn: productService.getFeatured,
    retry: 0,
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data: allProducts } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productService.getProducts({ page: 0, size: 8, sort: 'newest' }),
  });

  const handleQuickAdd = (product) => {
    addItem(product, product.sizes?.[0] || 'Free Size', product.colors?.[0] || 'Default', 1);
    toast.success('Added to cart!');
  };

  const shopName = settings?.shopName || 'Maala Clothing';

  return (
    <div className="texture-bg">
      {featuredError && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Shop catalog is loading slowly — our server may be waking up. Please refresh in a minute. If this keeps happening, the shop owner needs to start the backend.
        </div>
      )}
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden px-4 py-16 md:py-28">
        <div className="absolute inset-0 opacity-20">
          <img
            src={asset('/catalog/hero.jpg')}
            alt="Asian lawn and kurta collection"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#4F1529]/95 via-[#6B1D3A]/85 to-[#8B2E4E]/70" />

        <div className="hero-glow relative mx-auto flex max-w-7xl flex-col items-center rounded-3xl p-2 text-center md:items-start md:p-0 md:text-left">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-[#C9A962]/40 bg-white/10 px-4 py-1.5 text-sm text-[#E8D5A8] backdrop-blur-sm">
            <MapPin className="h-4 w-4" /> Mian Channu · Delivering across Pakistan
          </div>

          <img src={asset('/logo.svg')} alt={shopName} className="mx-auto mb-6 h-20 w-20 md:mx-0" />

          <div className="max-w-xl">
            <p className="font-display text-sm font-medium uppercase tracking-[0.3em] text-[#C9A962]">{shopName}</p>
            <h1 className="font-display mt-2 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {settings?.shopTagline || 'Elegant fashion delivered to your door'}
            </h1>
            <p className="mt-4 text-lg text-[#E8D5A8]/90">
              Lawn suits, kurtas, dupattas & more — handpicked with love from our boutique in Punjab.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link to="/products">
              <Button size="lg" variant="gold">Shop Collection <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <a
              href={`https://wa.me/${settings?.whatsappNumber || '923094094776'}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button size="lg" variant="whatsapp" className="px-8 shadow-[0_8px_24px_rgba(37,211,102,0.45)]">
                <MessageCircle className="h-5 w-5 shrink-0" />
                Order on WhatsApp
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 md:justify-start">
            {[
              { icon: Star, text: 'Premium Quality' },
              { icon: Truck, text: 'Leopard Courier' },
              { icon: Shield, text: 'Secure Payment' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[#E8D5A8]">
                <Icon className="h-4 w-4" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-line" />

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[#C9A962]">Curated for you</p>
            <h2 className="font-display mt-1 text-3xl font-bold text-[#4F1529]">Featured Collection</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-medium text-[#6B1D3A] hover:underline sm:block">
            View all →
          </Link>
        </div>
        {featuredLoading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {(featured || []).map((product) => (
              <div key={product.id} className="w-64 shrink-0 snap-start md:w-auto">
                <ProductCard product={product} onAddToCart={handleQuickAdd} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-[#C9A962]">Browse</p>
            <h2 className="font-display mt-1 text-3xl font-bold text-[#4F1529]">Shop by Category</h2>
          </div>
          {catLoading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(categories || []).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4F1529]/80 via-[#4F1529]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-xl font-semibold text-white">{cat.name}</h3>
                    <p className="mt-1 text-sm text-[#E8D5A8] opacity-0 transition group-hover:opacity-100">Shop now →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals grid */}
      {allProducts?.content?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-[#C9A962]">Just in</p>
            <h2 className="font-display mt-1 text-3xl font-bold text-[#4F1529]">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {allProducts.content.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleQuickAdd} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/products"><Button variant="primary">View All Products</Button></Link>
          </div>
        </section>
      )}

      {/* How to order */}
      <section className="bg-[#4F1529] px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-[#C9A962]">Simple process</p>
            <h2 className="font-display mt-1 text-3xl font-bold">How to Order</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, step: '01', title: 'Browse', desc: 'Explore our latest lawn, kurtas & dupattas' },
              { icon: ShoppingBag, step: '02', title: 'Add to Cart', desc: 'Pick your size, color & place your order' },
              { icon: CreditCard, step: '03', title: 'Pay in Advance', desc: 'EasyPaisa or JazzCash — 03094094776' },
              { icon: Truck, step: '04', title: 'Get Delivered', desc: 'Dispatched via Leopard Courier in 3–5 days' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#C9A962]/20 bg-white/5 p-6 backdrop-blur-sm">
                <span className="font-display text-3xl font-bold text-[#C9A962]/40">{step}</span>
                <div className="mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A962]/20">
                  <Icon className="h-6 w-6 text-[#E8D5A8]" />
                </div>
                <h3 className="mt-4 font-semibold text-[#E8D5A8]">{title}</h3>
                <p className="mt-2 text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
