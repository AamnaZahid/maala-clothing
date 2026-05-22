import { formatPrice } from '../../utils/formatPrice';
import { formatPhoneDisplay } from '../../utils/formatPhone';

export function PackingSlip({ order }) {
  if (!order) return null;

  return (
    <div id="packing-slip" className="hidden print:block">
      <div className="mx-auto max-w-[210mm] bg-white p-8 text-black">
        <header className="mb-8 flex items-start justify-between border-b-2 border-[#6B1D3A] pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Maala Clothing" className="h-16 w-16" />
            <div>
              <h1 className="font-display text-2xl font-bold text-[#4F1529]">Maala Clothing</h1>
              <p className="text-sm text-gray-600">Mian Channu, Pakistan</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Packing Slip</p>
            <p className="mt-1 font-display text-xl font-bold text-[#6B1D3A]">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString('en-PK')}
            </p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B1D3A]">Ship To</h2>
            <p className="text-lg font-semibold">{order.customerName}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-800">{order.deliveryAddress}</p>
            <p className="mt-1 text-sm font-medium">{order.city}</p>
            <p className="mt-2 text-sm">
              <span className="text-gray-500">Phone: </span>
              {formatPhoneDisplay(order.customerPhone)}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B1D3A]">Courier</h2>
            <p className="text-lg font-semibold">Leopards Courier</p>
            {order.leopardTrackingNumber && (
              <p className="mt-2 text-sm">
                <span className="text-gray-500">Tracking: </span>
                {order.leopardTrackingNumber}
              </p>
            )}
          </div>
        </section>

        <table className="mb-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[#6B1D3A] bg-[#FBF7F4]">
              <th className="px-3 py-2 text-left font-semibold">Product</th>
              <th className="px-3 py-2 text-left font-semibold">Size</th>
              <th className="px-3 py-2 text-left font-semibold">Color</th>
              <th className="px-3 py-2 text-center font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="px-3 py-3">{item.productName}</td>
                <td className="px-3 py-3">{item.size || '—'}</td>
                <td className="px-3 py-3">{item.color || '—'}</td>
                <td className="px-3 py-3 text-center">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="flex justify-between border-t border-gray-300 pt-4 text-xs text-gray-500">
          <p>Items: {(order.items || []).reduce((n, i) => n + i.quantity, 0)}</p>
          <p>Order total: {formatPrice(order.grandTotal)} (paid in advance)</p>
        </footer>
      </div>
    </div>
  );
}
