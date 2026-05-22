import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Share2, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
  });

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: settingsService.getPublicSettings,
  });

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingSkeleton count={1} /></div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const price = product.discountedPrice || product.effectivePrice || product.price;
  const outOfStock = product.stockQuantity === 0;

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes?.[0] || 'Free Size';
    const color = selectedColor || product.colors?.[0] || 'Default';
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addItem(product, size, color, quantity);
    toast.success('Added to cart!');
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Check out ${product.name} at Maala Clothing! ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImageGallery images={product.imageUrls} />

        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-rose-600">{formatPrice(price)}</span>
            {product.discountedPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mb-6 text-gray-600">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      selectedSize === size
                        ? 'border-rose-600 bg-rose-50 text-rose-600'
                        : 'border-gray-300 hover:border-rose-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border-2 px-4 py-1 text-sm ${
                      selectedColor === color ? 'border-rose-600' : 'border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center gap-4">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded border p-2 hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="rounded border p-2 hover:bg-gray-50"
                disabled={quantity >= product.stockQuantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button variant="secondary" onClick={shareWhatsApp}>
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </Button>
          </div>

          <div className="mt-6 rounded-lg bg-rose-50 p-4 text-sm">
            <p className="font-medium text-rose-800">Delivered via Leopard Courier</p>
            <p className="text-rose-700">3-5 business days | Flat {formatPrice(settings?.deliveryCharges || 250)} delivery on all orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
