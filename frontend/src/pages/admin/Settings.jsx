import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/settingsService';
import { uploadService } from '../../services/uploadService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export default function Settings() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('shop');
  const [form, setForm] = useState({});
  const [accountForm, setAccountForm] = useState({});
  const [editAccountId, setEditAccountId] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminService.getSettings,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const { data: accounts } = useQuery({
    queryKey: ['adminPaymentAccounts'],
    queryFn: adminService.getPaymentAccountsAdmin,
  });

  if (isLoading) return <LoadingSkeleton />;

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveSettings = async () => {
    try {
      const payload = {
        ...form,
        deliveryCharges: form.deliveryCharges !== '' && form.deliveryCharges != null
          ? Number(form.deliveryCharges) : undefined,
        freeDeliveryThreshold: 999999999,
      };
      await adminService.updateSettings(payload);
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const testWhatsApp = async () => {
    try {
      await adminService.testWhatsApp();
      toast.success('Test message sent!');
    } catch {
      toast.error('Failed to send test message');
    }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadService.uploadImage(file);
      updateField('shopLogoUrl', url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const saveAccount = async () => {
    try {
      if (editAccountId) {
        await adminService.updatePaymentAccount(editAccountId, accountForm);
      } else {
        await adminService.createPaymentAccount({ ...accountForm, isActive: true, displayOrder: accounts?.length || 0 });
      }
      queryClient.invalidateQueries({ queryKey: ['adminPaymentAccounts'] });
      setAccountForm({});
      setEditAccountId(null);
      toast.success('Account saved');
    } catch {
      toast.error('Failed to save account');
    }
  };

  const deleteAccount = async (id) => {
    if (!confirm('Delete this account?')) return;
    try {
      await adminService.deletePaymentAccount(id);
      queryClient.invalidateQueries({ queryKey: ['adminPaymentAccounts'] });
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const tabs = [
    { id: 'shop', label: 'Shop Info' },
    { id: 'whatsapp', label: 'WhatsApp & Notifications' },
    { id: 'payments', label: 'Payment Accounts' },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="mb-6 flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-b-2 border-rose-600 text-rose-600' : 'text-gray-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <Input label="Shop Name" value={form.shopName || ''} onChange={(e) => updateField('shopName', e.target.value)} />
          <Input label="Tagline" value={form.shopTagline || ''} onChange={(e) => updateField('shopTagline', e.target.value)} />
          <div>
            <label className="mb-2 block text-sm font-medium">Logo</label>
            {form.shopLogoUrl && <img src={form.shopLogoUrl} alt="Logo" className="mb-2 h-16 w-16 rounded object-cover" />}
            <input type="file" accept="image/*" onChange={uploadLogo} className="text-sm" />
          </div>
          <Input label="Announcement Banner" value={form.announcementBanner || ''} onChange={(e) => updateField('announcementBanner', e.target.value)} />
          <Input label="Delivery Charges (PKR) — applied to every order" type="number" value={form.deliveryCharges || ''} onChange={(e) => updateField('deliveryCharges', e.target.value)} />
          <Input label="Contact Email" value={form.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} />
          <Input label="Instagram URL" value={form.instagramUrl || ''} onChange={(e) => updateField('instagramUrl', e.target.value)} />
          <Input label="Facebook URL" value={form.facebookUrl || ''} onChange={(e) => updateField('facebookUrl', e.target.value)} />
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <Input
            label="WhatsApp Number (with country code, no +)"
            placeholder="923094094776"
            value={form.whatsappNumber || ''}
            onChange={(e) => updateField('whatsappNumber', e.target.value)}
          />
          <Input
            label="CallMeBot API Key"
            type="password"
            value={form.callmebotApiKey || ''}
            onChange={(e) => updateField('callmebotApiKey', e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Setup guide:{' '}
            <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noreferrer" className="text-rose-600 underline">
              CallMeBot WhatsApp API
            </a>
          </p>
          <div className="flex gap-3">
            <Button onClick={saveSettings}>Save</Button>
            <Button variant="secondary" onClick={testWhatsApp}>Send Test WhatsApp</Button>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-6">
          <div className="space-y-3">
            {(accounts || []).map((acc) => (
              <div key={acc.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium">{acc.accountType}</p>
                  <p className="text-sm">{acc.accountTitle} — {acc.accountNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditAccountId(acc.id); setAccountForm(acc); }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteAccount(acc.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold">{editAccountId ? 'Edit Account' : 'Add Account'}</h3>
            <select
              value={accountForm.accountType || ''}
              onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select type</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            <Input label="Account Title" value={accountForm.accountTitle || ''} onChange={(e) => setAccountForm({ ...accountForm, accountTitle: e.target.value })} />
            <Input label="Account Number" value={accountForm.accountNumber || ''} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} />
            <Input label="Bank Name (optional)" value={accountForm.bankName || ''} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} />
            <Button onClick={saveAccount}>{editAccountId ? 'Update' : 'Add'} Account</Button>
          </div>
        </div>
      )}
    </div>
  );
}
