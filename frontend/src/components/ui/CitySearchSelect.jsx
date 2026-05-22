import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { PAKISTANI_CITIES } from '../../constants/pakistaniCities';

export function CitySearchSelect({ value, onChange, error, label = 'City *' }) {
  const listId = useId();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = PAKISTANI_CITIES.filter((city) =>
    city.toLowerCase().includes((query || '').toLowerCase())
  );

  const selectCity = (city) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={listId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B2E4E]/50" />
        <input
          id={listId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search city — e.g. Lahore, Karachi"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={`w-full rounded-lg border py-2 pl-10 pr-10 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {open && filtered.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                role="option"
                aria-selected={value === city}
                onClick={() => selectCity(city)}
                className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#FBF7F4] ${
                  value === city ? 'bg-[#F3EBE4] font-medium text-[#6B1D3A]' : 'text-gray-800'
                }`}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query && filtered.length === 0 && (
        <p className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
          No matching city. Pick from the list or type a nearby major city.
        </p>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
