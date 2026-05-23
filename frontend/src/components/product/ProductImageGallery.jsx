import { useState } from 'react';
import { asset } from '../../utils/assetUrl';

export function ProductImageGallery({ images = [] }) {
  const [selected, setSelected] = useState(0);
  const displayImages = (images.length > 0 ? images : ['https://placehold.co/600x600/fce7f3/e11d48?text=Product']).map(asset);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={displayImages[selected]}
          alt="Product"
          className="h-full w-full object-cover"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {displayImages.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                selected === i ? 'border-rose-600' : 'border-transparent'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
