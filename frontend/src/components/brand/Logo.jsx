import { Link } from 'react-router-dom';

export function Logo({ shopName = 'Maala Clothing', size = 'md', showTagline = false }) {
  const sizes = {
    sm: { img: 'h-9 w-9', title: 'text-base', tag: 'text-[10px]' },
    md: { img: 'h-11 w-11', title: 'text-lg', tag: 'text-xs' },
    lg: { img: 'h-14 w-14', title: 'text-2xl', tag: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className="group flex items-center gap-3">
      <img
        src="/logo.svg"
        alt={shopName}
        className={`${s.img} shrink-0 transition group-hover:scale-105`}
      />
      <div className="hidden sm:block">
        <p className={`font-display font-semibold leading-tight text-[#4F1529] ${s.title}`}>
          {shopName}
        </p>
        {showTagline && (
          <p className={`tracking-wide text-[#8B2E4E]/80 ${s.tag}`}>Mian Channu · Pakistan</p>
        )}
      </div>
    </Link>
  );
}
