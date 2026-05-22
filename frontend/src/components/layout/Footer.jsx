import { Link } from 'react-router-dom';
import { Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '../brand/Logo';

export function Footer({ settings }) {
  const shopName = settings?.shopName || 'Maala Clothing';
  const whatsapp = settings?.whatsappNumber || '923094094776';

  return (
    <footer className="border-t border-[#E8D5A8]/30 bg-[#4F1529] text-[#E8D5A8]/80">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo shopName={shopName} />
            <p className="mt-4 text-sm leading-relaxed">
              {settings?.shopTagline || 'Elegant fashion from Mian Channu, delivered to your door'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[#C9A962]" /> Mian Channu, Punjab, Pakistan
            </div>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold text-[#E8D5A8]">How to Order</h4>
            <ol className="space-y-2.5 text-sm">
              <li className="flex gap-2"><span className="text-[#C9A962]">1.</span> Browse our collection</li>
              <li className="flex gap-2"><span className="text-[#C9A962]">2.</span> Add to cart & place order</li>
              <li className="flex gap-2"><span className="text-[#C9A962]">3.</span> Pay via EasyPaisa / JazzCash</li>
              <li className="flex gap-2"><span className="text-[#C9A962]">4.</span> Receive via Leopard Courier</li>
            </ol>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold text-[#E8D5A8]">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-white">
                <Phone className="h-4 w-4 text-[#C9A962]" /> WhatsApp: 0309-4094776
              </a>
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 transition hover:text-white">
                  <Mail className="h-4 w-4 text-[#C9A962]" /> {settings.contactEmail}
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-white">
                  <Globe className="h-4 w-4 text-[#C9A962]" /> Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#C9A962]/10 py-5 text-center text-xs text-[#E8D5A8]/50">
        © {new Date().getFullYear()} {shopName}. All rights reserved.
      </div>
    </footer>
  );
}
