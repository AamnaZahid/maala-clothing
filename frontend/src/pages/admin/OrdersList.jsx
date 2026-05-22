import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminService } from '../../services/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { ORDER_STATUSES } from '../../utils/orderStatus';

export default function OrdersList() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminOrders', status, page],
    queryFn: () => adminService.getOrders({ status: status || undefined, page, size: 20 }),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        className="mb-4 rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">All Statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {isError ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Could not load orders. Refresh the page or log in again as admin.</p>
      ) : isLoading ? (
        <LoadingSkeleton type="list" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Order#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content || []).map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3">{order.customerPhone}</td>
                    <td className="px-4 py-3">{formatPrice(order.grandTotal)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('en-PK')}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(data?.content || []).length && (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No orders yet.</p>
            )}
          </div>
          {data?.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm">Page {page + 1} of {data.totalPages}</span>
              <Button variant="secondary" disabled={data.last} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
