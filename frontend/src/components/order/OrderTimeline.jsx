import { Check } from 'lucide-react';
import { ORDER_STATUSES, STATUS_CONFIG, getStatusIndex } from '../../utils/orderStatus';

export function OrderTimeline({ status, updatedAt }) {
  const currentIndex = getStatusIndex(status);

  const displayStatuses = ORDER_STATUSES.filter((s) => s !== 'CANCELLED' && s !== 'PENDING_PAYMENT');

  return (
    <div className="space-y-0">
      {displayStatuses.map((s, i) => {
        const isCompleted = getStatusIndex(s) <= currentIndex;
        const isCurrent = s === status;
        const config = STATUS_CONFIG[s];

        return (
          <div key={s} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-rose-100' : ''}`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              {i < displayStatuses.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-[2rem] ${isCompleted ? 'bg-rose-600' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-8">
              <p className={`font-medium ${isCurrent ? 'text-rose-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {config.label}
              </p>
              <p className="text-sm text-gray-500">{config.description}</p>
              {isCurrent && updatedAt && (
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(updatedAt).toLocaleString('en-PK')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
