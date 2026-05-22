import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: adminService.getDashboardStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: adminService.getRecentOrders,
  });

  const { data: lowStock } = useQuery({
    queryKey: ['lowStock'],
    queryFn: adminService.getLowStock,
  });

  const confirmPayment = async (orderId) => {
    try {
      await adminService.updateOrderStatus(orderId, 'PAYMENT_CONFIRMED');
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Payment confirmed');
    } catch {
      toast.error('Failed to update');
    }
  };

  const dispatchOrder = async (orderId) => {
    try {
      await adminService.updateOrderStatus(orderId, 'DISPATCHED');
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      toast.success('Marked as dispatched');
    } catch {
      toast.error('Failed to update');
    }
  };

  if (statsLoading) return <LoadingSkeleton type="list" />;

  const statCards = [
    { label: "Today's Orders", value: stats?.todayOrders || 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending Payment', value: stats?.pendingPaymentConfirmation || 0, color: 'bg-orange-50 text-orange-700' },
    { label: "Month's Revenue", value: formatPrice(stats?.monthRevenue || 0), color: 'bg-green-50 text-green-700' },
    { label: 'Dispatched', value: stats?.totalDispatched || 0, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-6 ${card.color}`}>
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/admin/orders"><Button size="sm" variant="secondary">View All</Button></Link>
        </div>
        {ordersLoading ? (
          <LoadingSkeleton type="list" count={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Order#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">{formatPrice(order.grandTotal)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
                        {order.status === 'PAYMENT_SUBMITTED' && (
                          <Button size="sm" onClick={() => confirmPayment(order.id)}>Confirm</Button>
                        )}
                        {order.status === 'PAYMENT_CONFIRMED' && (
                          <Button size="sm" variant="secondary" onClick={() => dispatchOrder(order.id)}>Dispatch</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(lowStock || []).length > 0 && (
        <div className="rounded-xl bg-red-50 p-6">
          <h2 className="mb-4 font-semibold text-red-800">Low Stock Alert</h2>
          <ul className="space-y-2">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-medium text-red-600">{p.stockQuantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
