import { Badge } from '../ui/Badge';
import { STATUS_CONFIG } from '../../utils/orderStatus';

export function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return <Badge className={config.color}>{config.label}</Badge>;
}
