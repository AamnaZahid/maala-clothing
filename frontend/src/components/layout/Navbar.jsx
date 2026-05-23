import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Lock } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CartDrawer } from '../cart/CartDrawer';
import { Logo } from '../brand/Logo';

export function Navbar({ shopName = 'Maala Clothing' }) {
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/track', label: 'Track Order' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[#E8D5A8]/40 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Logo shopName={shopName} showTagline />

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-[#4F1529]/80 transition hover:text-[#6B1D3A]"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="hidden flex-1 lg:block lg:max-w-xs xl:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B2E4E]/50" />
              <input
                type="search"
                placeholder="Search lawn, kurtas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[#E8D5A8] bg-[#FBF7F4] py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#6B1D3A] focus:ring-2 focus:ring-[#6B1D3A]/10"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 transition hover:bg-[#F3EBE4]"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5 text-[#4F1529]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B1D3A] text-xs font-bold text-[#E8D5A8]">
                  {itemCount}
                </span>
              )}
            </button>

            {user && isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1D3A] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#4F1529] sm:px-4 sm:text-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Jiya</span>
              </Link>
            ) : (
              <Link
                to="/login"
                title="Shop owner sign in"
                aria-label="Admin sign in"
                className="rounded-full p-2.5 text-[#4F1529]/70 transition hover:bg-[#F3EBE4] hover:text-[#6B1D3A]"
              >
                <Lock className="h-5 w-5" />
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2.5 hover:bg-[#F3EBE4] md:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E8D5A8]/40 bg-white px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[#E8D5A8] bg-[#FBF7F4] px-4 py-2.5 text-sm"
              />
            </form>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2.5 font-medium text-[#4F1529]" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user && isAdmin ? (
              <Link
                to="/admin"
                className="block py-2.5 font-medium text-[#6B1D3A]"
                onClick={() => setMenuOpen(false)}
              >
                Admin Jiya
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-2 flex items-center gap-2 border-t border-[#E8D5A8]/40 pt-3 text-sm text-[#4F1529]/70"
                onClick={() => setMenuOpen(false)}
              >
                <Lock className="h-4 w-4" /> Shop owner sign in
              </Link>
            )}
          </div>
        )}
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
