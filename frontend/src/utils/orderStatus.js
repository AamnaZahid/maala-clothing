export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAYMENT_SUBMITTED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

export const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', description: 'Waiting for payment' },
  PAYMENT_SUBMITTED: { label: 'Payment Submitted', color: 'bg-orange-100 text-orange-800', description: 'Payment received, awaiting verification' },
  PAYMENT_CONFIRMED: { label: 'Payment Confirmed', color: 'bg-blue-100 text-blue-800', description: 'Payment verified, order being prepared' },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800', description: 'Your order is being packed' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-purple-100 text-purple-800', description: 'Shipped via Leopard Courier' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', description: 'Order delivered successfully' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', description: 'Order was cancelled' },
};

export function getStatusIndex(status) {
  return ORDER_STATUSES.indexOf(status);
}
