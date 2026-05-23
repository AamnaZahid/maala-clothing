import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, ShoppingBag, Package, Wallet, Coins, Boxes, Crown, RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StatCard({ icon: Icon, label, value, hint, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-white text-[#4F1529]',
    good: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    bad: 'bg-rose-50 text-rose-900 border-rose-200',
    accent: 'bg-[#FBF7F4] text-[#4F1529] border-[#C9A962]/30',
  };
  return (
    <div className={`rounded-2xl border border-[#E8D5A8]/40 p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <p className="mt-1 text-xs opacity-70">{hint}</p>}
    </div>
  );
}

export default function Reports() {
  const today = new Date();
  const [range, setRange] = useState('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const queryKey = useMemo(() => ['report', range, year, month], [range, year, month]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      adminService.getReport(range === 'lifetime' ? { range } : { range: 'month', year, month }),
  });

  const years = useMemo(() => {
    const list = [];
    for (let y = today.getFullYear(); y >= today.getFullYear() - 5; y--) list.push(y);
    return list;
  }, [today]);

  const isProfit = (data?.netResult ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#4F1529]">Reports & Profit Tracking</h1>
          <p className="text-sm text-gray-500">
            See exactly how much you spent, sold, and earned this month — for {`"Admin Jiya"`} eyes only.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="month">By Month</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          {range === 'month' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <Button variant="secondary" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load report. Make sure backend is running and you are logged in as admin.
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton type="list" />
      ) : data ? (
        <>
          <div className="rounded-2xl border border-[#C9A962]/30 bg-[#FBF7F4] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B2E4E]/70">Showing</p>
                <h2 className="font-display text-xl font-semibold text-[#4F1529]">
                  {data.label} — {data.periodStart} to {data.periodEnd}
                </h2>
              </div>
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                  isProfit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                Net Result: {formatPrice(data.netResult)}
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#4F1529]/80">
              In this period, you bought stock worth{' '}
              <strong>{formatPrice(data.stockSpending)}</strong>
              {data.stockUnitsBought > 0 && ` (${data.stockUnitsBought} items)`} and sold{' '}
              <strong>{data.itemsSold}</strong> items across{' '}
              <strong>{data.ordersCount}</strong> orders, earning{' '}
              <strong>{formatPrice(data.revenue)}</strong>. After cost of goods, your gross profit
              is <strong>{formatPrice(data.grossProfit)}</strong>.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={ShoppingBag} label="Orders" value={data.ordersCount} hint={`${data.itemsSold} items sold`} />
            <StatCard icon={Wallet} label="Revenue (sales)" value={formatPrice(data.revenue)} hint="Money customers paid" tone="accent" />
            <StatCard icon={Package} label="Cost of Goods Sold" value={formatPrice(data.costOfGoodsSold)} hint="What those items cost you" />
            <StatCard icon={Coins} label="Gross Profit" value={formatPrice(data.grossProfit)} hint="Revenue − cost of items sold" tone={data.grossProfit >= 0 ? 'good' : 'bad'} />
            <StatCard icon={Boxes} label="Stock You Bought" value={formatPrice(data.stockSpending)} hint="Money spent on new stock" />
            <StatCard
              icon={isProfit ? TrendingUp : TrendingDown}
              label="Net Result"
              value={formatPrice(data.netResult)}
              hint="Gross profit − stock spending"
              tone={isProfit ? 'good' : 'bad'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E8D5A8]/40 bg-white p-5 shadow-sm">
              <h3 className="font-display mb-3 flex items-center gap-2 text-base font-semibold text-[#4F1529]">
                <Crown className="h-4 w-4 text-[#C9A962]" /> Top Selling Products
              </h3>
              {(!data.topProducts || data.topProducts.length === 0) ? (
                <p className="text-sm text-gray-500">No sales recorded in this period.</p>
              ) : (
                <ul className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <li key={p.productId} className="flex items-center justify-between gap-3 border-b border-[#E8D5A8]/30 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A962]/20 text-xs font-bold text-[#4F1529]">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-[#4F1529]">{p.productName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{p.quantitySold} sold</p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(p.revenue)} · profit {formatPrice(p.profit)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-[#E8D5A8]/40 bg-white p-5 shadow-sm">
              <h3 className="font-display mb-3 text-base font-semibold text-[#4F1529]">Inventory snapshot</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items currently in stock</span>
                  <span className="font-semibold">{data.totalStockOnHand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value at cost</span>
                  <span className="font-semibold">{formatPrice(data.inventoryValueAtCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery charges collected</span>
                  <span className="font-semibold">{formatPrice(data.deliveryCollected)}</span>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-[#FBF7F4] p-3 text-xs text-[#4F1529]/80">
                Tip: When you buy new stock, click <strong>Restock</strong> on a product in the Products page so it counts as
                spending here.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
