import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MessageCircle, ExternalLink, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import { formatPhoneDisplay, whatsAppDigits } from '../../utils/formatPhone';
import { asset } from '../../utils/assetUrl';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { PackingSlip } from '../../components/order/PackingSlip';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ORDER_STATUSES } from '../../utils/orderStatus';

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [notes, setNotes] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['adminOrder', id],
    queryFn: () => adminService.getOrder(id),
  });

  if (isLoading) return <LoadingSkeleton type="list" />;
  if (!order) return <p>Order not found</p>;

  const updateStatus = async () => {
    try {
      await adminService.updateOrderStatus(id, status || order.status);
      queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const saveTracking = async () => {
    try {
      await adminService.updateTracking(id, tracking);
      queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
      toast.success('Tracking saved');
    } catch {
      toast.error('Failed to save tracking');
    }
  };

  const saveNotes = async () => {
    try {
      await adminService.updateNotes(id, notes);
      queryClient.invalidateQueries({ queryKey: ['adminOrder', id] });
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const whatsappLink = `https://wa.me/${whatsAppDigits(order.customerPhone)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PackingSlip order={order} />

      <div className="print:hidden max-w-4xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-PK')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print Packing Slip
            </Button>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Customer</h2>
            <p className="font-medium">{order.customerName}</p>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-green-600">
              <MessageCircle className="h-4 w-4" /> {formatPhoneDisplay(order.customerPhone)}
            </a>
            {order.customerEmail && <p className="mt-1 text-sm text-gray-500">{order.customerEmail}</p>}
            <p className="mt-3 text-sm">{order.deliveryAddress}, {order.city}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Payment</h2>
            <p className="text-sm"><span className="text-gray-500">Method:</span> {order.paymentMethod}</p>
            <p className="text-sm"><span className="text-gray-500">Transaction ID:</span> {order.paymentTransactionId}</p>
            {order.paymentScreenshotUrl && (
              <a href={asset(order.paymentScreenshotUrl)} target="_blank" rel="noreferrer">
                <img src={asset(order.paymentScreenshotUrl)} alt="Payment" className="mt-3 h-24 rounded border object-cover" />
              </a>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 border-b pb-3">
                <img src={asset(item.productImageUrl)} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.size} | {item.color} × {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(order.deliveryCharges)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span>{formatPrice(order.grandTotal)}</span></div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Update Status</h2>
            <select
              value={status || order.status}
              onChange={(e) => setStatus(e.target.value)}
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Button onClick={updateStatus} className="w-full">Update Status</Button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Leopard Tracking</h2>
            <Input
              placeholder="Tracking number"
              defaultValue={order.leopardTrackingNumber || ''}
              onChange={(e) => setTracking(e.target.value)}
            />
            <Button onClick={saveTracking} className="mt-3 w-full">Save Tracking Number</Button>
            {order.leopardTrackingNumber && (
              <a
                href="https://www.leopardscourier.com/leopard/public/track_your_parcel"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600"
              >
                Track on Leopard <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Admin Notes</h2>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={3}
            defaultValue={order.adminNotes || ''}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button onClick={saveNotes} className="mt-3">Save Notes</Button>
        </div>
      </div>
    </>
  );
}
