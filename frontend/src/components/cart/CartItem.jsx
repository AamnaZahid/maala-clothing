import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { asset } from '../../utils/assetUrl';

export function CartItem({ item, index }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="mb-4 flex gap-3 rounded-lg border p-3">
      <img
        src={asset(item.imageUrl) || 'https://placehold.co/80x80'}
        alt={item.name}
        className="h-20 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col">
        <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
        <p className="text-xs text-gray-500">
          {item.size && `Size: ${item.size}`}
          {item.color && ` | Color: ${item.color}`}
        </p>
        <p className="mt-1 text-sm font-semibold text-rose-600">{formatPrice(item.price)}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(index, item.quantity - 1)}
              className="rounded border p-1 hover:bg-gray-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(index, item.quantity + 1)}
              className="rounded border p-1 hover:bg-gray-50"
              disabled={item.quantity >= item.stockQuantity}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
