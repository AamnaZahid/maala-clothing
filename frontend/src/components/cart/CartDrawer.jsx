import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { Button } from '../ui/Button';
import { CartItem } from './CartItem';

export function CartDrawer({ open, onClose }) {
  const { items, subtotal } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Your cart is empty</p>
          ) : (
            items.map((item, index) => <CartItem key={index} item={item} index={index} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={onClose}>
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
