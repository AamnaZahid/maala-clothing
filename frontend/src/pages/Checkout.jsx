import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Copy, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { settingsService } from '../services/settingsService';
import { orderService } from '../services/orderService';
import { uploadService } from '../services/uploadService';
import { Input } from '../components/ui/Input';
import { CitySearchSelect } from '../components/ui/CitySearchSelect';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/formatPrice';
import { getApiError } from '../services/api';

const step1Schema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  deliveryAddress: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
});

const step3Schema = z.object({
  paymentMethod: z.string().min(1, 'Select payment method'),
  paymentTransactionId: z.string().min(3, 'Transaction ID is required'),
  paymentConfirmed: z.boolean().refine((val) => val === true, { message: 'Please confirm payment' }),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: settingsService.getPublicSettings,
  });

  const { data: paymentAccounts } = useQuery({
    queryKey: ['paymentAccounts'],
    queryFn: settingsService.getPaymentAccounts,
  });

  const deliveryCharges = settings?.deliveryCharges ?? 250;
  const grandTotal = subtotal + deliveryCharges;

  const form1 = useForm({ resolver: zodResolver(step1Schema) });
  const form3 = useForm({ resolver: zodResolver(step3Schema) });

  const placeOrderMutation = useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: (order) => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-placed/${order.orderNumber}`);
    },
    onError: (err) => toast.error(typeof getApiError(err) === 'string' ? getApiError(err) : 'Failed to place order'),
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const onStep1 = (data) => {
    setCustomerData(data);
    setStep(2);
  };

  const onStep3 = (data) => {
    placeOrderMutation.mutate({
      ...customerData,
      customerEmail: customerData.customerEmail || undefined,
      paymentMethod: data.paymentMethod,
      paymentTransactionId: data.paymentTransactionId,
      paymentScreenshotUrl: screenshotUrl || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadService.uploadPaymentProof(file);
      setScreenshotUrl(url);
      toast.success('Screenshot uploaded');
    } catch {
      toast.error('Upload failed. You can still place order without screenshot.');
    } finally {
      setUploading(false);
    }
  };

  const steps = ['Details', 'Review', 'Payment'];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step > i + 1 ? 'bg-rose-600 text-white' : step === i + 1 ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${step === i + 1 ? 'font-medium' : 'text-gray-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className="mx-2 h-0.5 w-8 bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Customer Details</h2>
          <Input label="Full Name *" {...form1.register('customerName')} error={form1.formState.errors.customerName?.message} />
          <Input
            label="WhatsApp Phone Number *"
            placeholder="03094094776"
            {...form1.register('customerPhone')}
            error={form1.formState.errors.customerPhone?.message}
          />
          <p className="-mt-2 text-xs text-gray-500">We will contact you on this number</p>
          <Input label="Email (optional)" type="email" {...form1.register('customerEmail')} error={form1.formState.errors.customerEmail?.message} />
          <Input label="Complete Delivery Address *" {...form1.register('deliveryAddress')} error={form1.formState.errors.deliveryAddress?.message} />
          <Controller
            name="city"
            control={form1.control}
            render={({ field, fieldState }) => (
              <CitySearchSelect
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Button type="submit" className="w-full">Continue to Review</Button>
        </form>
      )}

      {step === 2 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Order Review</h2>
          <div className="space-y-3 border-b pb-4">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.size} | {item.color} × {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 py-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatPrice(deliveryCharges)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-rose-600">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(3)} className="flex-1">Continue to Payment</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Send Payment to Complete Your Order</h2>

          <div className="space-y-3">
            {(paymentAccounts || []).map((acc) => (
              <div key={acc.id} className="rounded-lg border p-4">
                <p className="font-semibold text-rose-600">{acc.accountType}</p>
                <p className="text-sm">Account Title: {acc.accountTitle}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{acc.accountNumber}</p>
                  <button type="button" onClick={() => copyToClipboard(acc.accountNumber)}>
                    <Copy className="h-4 w-4 text-gray-400 hover:text-rose-600" />
                  </button>
                </div>
                {acc.bankName && <p className="text-xs text-gray-500">Bank: {acc.bankName}</p>}
              </div>
            ))}
          </div>

          <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
            Transfer EXACTLY {formatPrice(grandTotal)} and save your transaction ID
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Method *</label>
            <select
              {...form3.register('paymentMethod')}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select method</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            {form3.formState.errors.paymentMethod && (
              <p className="mt-1 text-xs text-red-600">{form3.formState.errors.paymentMethod.message}</p>
            )}
          </div>

          <Input
            label="Transaction ID / Screenshot Number *"
            {...form3.register('paymentTransactionId')}
            error={form3.formState.errors.paymentTransactionId?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">Upload payment screenshot (optional)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-gray-500 hover:border-rose-300">
              <Upload className="h-5 w-5" />
              {uploading ? 'Uploading...' : screenshotUrl ? 'Screenshot uploaded ✓' : 'Click to upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} disabled={uploading} />
            </label>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" {...form3.register('paymentConfirmed')} className="mt-1" />
            <span>I confirm I have sent the payment of {formatPrice(grandTotal)}</span>
          </label>
          {form3.formState.errors.paymentConfirmed && (
            <p className="text-xs text-red-600">{form3.formState.errors.paymentConfirmed.message}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button type="submit" loading={placeOrderMutation.isPending} className="flex-1">Place Order</Button>
          </div>
        </form>
      )}
    </div>
  );
}
