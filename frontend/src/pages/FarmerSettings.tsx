import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUpdateProfile } from '../services/api';
import { MapPin, User, Bell, CheckCircle, Loader2 } from 'lucide-react';

const DISTRICTS = ['Pune', 'Nashik', 'Aurangabad', 'Kolhapur', 'Nagpur'];
const BLOCKS: Record<string, string[]> = {
  Pune: ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Bhor'],
  Nashik: ['Niphad', 'Sinnar', 'Dindori', 'Igatpuri'],
  Aurangabad: ['Gangapur', 'Vaijapur', 'Kannad'],
  Kolhapur: ['Karveer', 'Hatkanangle', 'Shirol'],
  Nagpur: ['Hingna', 'Kamthi', 'Ramtek'],
};
const PANCHAYATS: Record<string, string[]> = {
  Haveli:  ['Uruli Kanchan','Wagholi','Loni Kalbhor','Theur','Kunjirwadi','Manjari','Phursungi'],
  Mulshi:  ['Pirangut','Lavale','Paud','Bhugaon'],
  Niphad:  ['Niphad','Pimpalgaon','Lasalgaon','Vinchur'],
  Karveer: ['Karveer','Nagaon','Kurundwad'],
};

type SettingsTab = 'location' | 'profile' | 'notifications';

const FarmerSettings = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('location');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  // Location state
  const [district,  setDistrict]  = useState(user?.district       || 'Pune');
  const [block,     setBlock]     = useState(user?.block          || 'Haveli');
  const [panchayat, setPanchayat] = useState(user?.panchayat_name || '');

  // Profile state
  const [name,  setName]  = useState(user?.name  || '');
  const [phone, setPhone] = useState(user?.phone  || '');

  // Notifications state
  const [smsAlerts, setSmsAlerts] = useState(user?.sms_alerts ?? true);
  const [language,  setLanguage]  = useState(user?.language   || 'en');

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const save = async (data: Record<string, any>) => {
    setSaving(true); setError('');
    try {
      await apiUpdateProfile(data);
      updateUser(data);
      showSaved();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to save. Check if backend is running.');
    } finally { setSaving(false); }
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'location',      label: 'Location',      icon: <MapPin size={16}/> },
    { key: 'profile',       label: 'Profile',        icon: <User size={16}/> },
    { key: 'notifications', label: 'Notifications',  icon: <Bell size={16}/> },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-text">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your location, profile and notification preferences</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tab === t.key ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16}/> Changes saved successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* ── LOCATION TAB ── */}
      {tab === 'location' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={20} className="text-primary"/>
            <h2 className="font-bold text-dark-text">Your Farm Location</h2>
          </div>
          <p className="text-sm text-gray-500">
            Your location determines which Panchayat-level weather data and advisories you receive.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">State</label>
              <select className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" disabled>
                <option>Maharashtra</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">District</label>
              <select value={district} onChange={e => {
                setDistrict(e.target.value);
                setBlock(BLOCKS[e.target.value]?.[0] || '');
                setPanchayat('');
              }} className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Block</label>
              <select value={block} onChange={e => { setBlock(e.target.value); setPanchayat(''); }}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                {(BLOCKS[district] || []).map(b => <option key={b}>{b} Block</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Panchayat</label>
              <select value={panchayat} onChange={e => setPanchayat(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="">-- Select Panchayat --</option>
                {(PANCHAYATS[block.replace(' Block','')] || []).map(p => <option key={p}>{p}</option>)}
              </select>
              {!(PANCHAYATS[block.replace(' Block','')]) && (
                <p className="text-xs text-gray-400 mt-1">All panchayats in {block} will receive downscaled data</p>
              )}
            </div>
          </div>

          <div className="pt-2 bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-700">
            <strong>Note:</strong> Changing your location updates the weather forecasts, crop advisories, and SMS alerts you receive.
          </div>

          <button onClick={() => save({ district, block: block.replace(' Block',''), panchayat_name: panchayat || undefined })}
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : '💾 Save Location'}
          </button>
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={20} className="text-primary"/>
            <h2 className="font-bold text-dark-text">Personal Information</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-extrabold text-primary">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-dark-text">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">FARMER</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210"
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email (read-only)</label>
              <input value={user?.email || ''} disabled
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400" />
            </div>
          </div>

          <button onClick={() => save({ name, phone: phone || undefined })} disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : '💾 Save Profile'}
          </button>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={20} className="text-primary"/>
            <h2 className="font-bold text-dark-text">Notification Preferences</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border">
            <div>
              <p className="font-bold text-dark-text text-sm">SMS Alerts (Twilio)</p>
              <p className="text-xs text-gray-500 mt-0.5">Receive HIGH risk crop advisories via SMS</p>
            </div>
            <button onClick={() => setSmsAlerts(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors ${smsAlerts ? 'bg-primary' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${smsAlerts ? 'translate-x-7' : 'translate-x-1'}`}/>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferred Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="mt-2 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
              <option value="mr">🇮🇳 मराठी (Marathi)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">SMS alerts and advisories will be sent in your preferred language</p>
          </div>

          <button onClick={() => save({ sms_alerts: smsAlerts, language })} disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : '💾 Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmerSettings;
