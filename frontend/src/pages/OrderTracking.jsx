import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Package, ExternalLink } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { OrderStatusBadge } from '../components/order/OrderStatusBadge';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { formatPrice } from '../utils/formatPrice';
import { getApiError } from '../services/api';

const schema = z.object({
  orderNumber: z.string().min(5, 'Enter order number e.g. ORD-202401-0047'),
  phone: z.string().min(10, 'Enter phone number used during order'),
});

export default function OrderTracking() {
  const [order, setOrder] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const trackMutation = useMutation({
    mutationFn: ({ orderNumber, phone }) => orderService.trackOrder(orderNumber, phone),
    onSuccess: setOrder,
    onError: (err) => setOrder(null),
  });

  const onSubmit = (data) => {
    trackMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-rose-600" />
        <h1 className="text-2xl font-bold">Track Your Order</h1>
        <p className="text-sm text-gray-500">Enter your order number and phone to track</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <Input
          label="Order Number"
          placeholder="ORD-202401-0047"
          {...register('orderNumber')}
          error={errors.orderNumber?.message}
        />
        <Input
          label="Phone Number"
          placeholder="03094094776"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Button type="submit" loading={trackMutation.isPending} className="w-full">
          Track Order
        </Button>
        {trackMutation.isError && (
          <p className="text-center text-sm text-red-600">
            {typeof getApiError(trackMutation.error) === 'string'
              ? getApiError(trackMutation.error)
              : 'Order not found'}
          </p>
        )}
      </form>

      {order && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="font-bold">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-PK')}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Items</p>
              <p className="font-medium">{order.items?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Grand Total</p>
              <p className="font-medium">{formatPrice(order.grandTotal)}</p>
            </div>
          </div>

          <OrderTimeline status={order.status} updatedAt={order.updatedAt} />

          {order.status === 'DISPATCHED' && order.leopardTrackingNumber && (
            <div className="mt-6 rounded-lg bg-purple-50 p-4">
              <p className="mb-1 text-sm font-medium text-purple-800">Leopard Tracking Number</p>
              <p className="font-bold text-purple-900">{order.leopardTrackingNumber}</p>
              <a
                href="https://www.leopardscourier.com/leopard/public/track_your_parcel"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
              >
                Track on Leopard Courier <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
