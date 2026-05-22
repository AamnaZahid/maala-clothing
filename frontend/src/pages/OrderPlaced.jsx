import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import { Button } from '../components/ui/Button';

export default function OrderPlaced() {
  const { orderNumber } = useParams();

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: settingsService.getPublicSettings,
  });

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied!');
  };

  const whatsapp = settings?.whatsappNumber || '923094094776';

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Order is Placed!</h1>
      <p className="mb-6 text-gray-600">
        We will verify your payment and confirm within a few hours.
        You will be contacted on WhatsApp.
      </p>

      <div className="mb-8 rounded-xl bg-rose-50 p-6">
        <p className="text-sm text-gray-600">Order Number</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-2xl font-bold text-rose-600">{orderNumber}</p>
          <button onClick={copyOrderNumber} className="rounded p-1 hover:bg-rose-100">
            <Copy className="h-5 w-5 text-rose-600" />
          </button>
        </div>
      </div>

      <div className="mb-8 space-y-3">
        <Link to="/track">
          <Button className="w-full">Track Your Order</Button>
        </Link>
        <Link to="/products">
          <Button variant="secondary" className="w-full">Continue Shopping</Button>
        </Link>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        The seller will contact you on WhatsApp to confirm payment.
        If you don&apos;t hear back in 2 hours, WhatsApp us directly.
      </p>

      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
      >
        Contact Seller on WhatsApp
      </a>
    </div>
  );
}
