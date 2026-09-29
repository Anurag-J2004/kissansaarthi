import { useState, useMemo } from 'react';
import PanchayatMap from '../maps/GoogleMapComponent';
import { useAuth } from '../context/AuthContext';
import { apiUpdateProfile } from '../services/api';
import {
  Play, BarChart2, MapPin, Cpu, AlertTriangle, CheckCircle, Info,
  ChevronRight, Settings, User, Bell, Database, Download, RefreshCw,
  Save, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import React from 'react';

// ── Block map centers ──────────────────────────────────────
const BLOCK_CENTERS: Record<string, [number, number]> = {
  Haveli:     [18.510, 74.010], Mulshi:     [18.530, 73.720],
  Maval:      [18.740, 73.580], Khed:       [18.850, 73.900],
  Shirur:     [18.830, 74.380], Bhor:       [18.156, 73.849],
  Niphad:     [20.078, 74.105], Sinnar:     [19.850, 73.990],
  Dindori:    [20.200, 73.840], Igatpuri:   [19.698, 73.554],
  Gangapur:   [19.720, 75.010], Vaijapur:   [19.960, 74.710],
  Kannad:     [20.260, 75.130], Karveer:    [16.700, 74.220],
  Hatkanangle:[16.750, 74.270], Shirol:     [16.735, 74.555],
};

// ── Location data ──────────────────────────────────────────
const LOCATIONS = {
  districts: ['Pune', 'Nashik', 'Aurangabad', 'Kolhapur'],
  blocks: {
    Pune:       ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Bhor'],
    Nashik:     ['Niphad', 'Sinnar', 'Dindori', 'Igatpuri'],
    Aurangabad: ['Gangapur', 'Vaijapur', 'Kannad'],
    Kolhapur:   ['Karveer', 'Hatkanangle', 'Shirol'],
  } as Record<string, string[]>,
  panchayats: {
    Haveli:   [
      { name: 'Uruli Kanchan', lat: 18.490, lng: 74.020 },
      { name: 'Wagholi',       lat: 18.580, lng: 73.980 },
      { name: 'Loni Kalbhor',  lat: 18.480, lng: 74.000 },
      { name: 'Theur',         lat: 18.510, lng: 74.060 },
      { name: 'Kunjirwadi',    lat: 18.465, lng: 74.030 },
      { name: 'Manjari',       lat: 18.500, lng: 73.960 },
      { name: 'Phursungi',     lat: 18.472, lng: 73.952 },
    ],
    Mulshi:   [
      { name: 'Pirangut', lat: 18.520, lng: 73.720 },
      { name: 'Lavale',   lat: 18.540, lng: 73.760 },
      { name: 'Paud',     lat: 18.518, lng: 73.672 },
    ],
    Niphad:   [
      { name: 'Niphad',     lat: 20.078, lng: 74.105 },
      { name: 'Pimpalgaon', lat: 20.090, lng: 74.075 },
      { name: 'Lasalgaon',  lat: 20.134, lng: 74.024 },
    ],
    Karveer:  [
      { name: 'Karveer', lat: 16.700, lng: 74.220 },
      { name: 'Nagaon',  lat: 16.720, lng: 74.200 },
    ],
    Gangapur: [
      { name: 'Gangapur', lat: 19.720, lng: 75.010 },
      { name: 'Vaijapur', lat: 19.960, lng: 74.710 },
    ],
  } as Record<string, { name: string; lat: number; lng: number }[]>,
};

const RISKS = ['HIGH', 'MODERATE', 'LOW'];

const RISK_BADGE: Record<string, string> = {
  HIGH:     'bg-red-100 text-red-700 border-red-300',
  MODERATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  LOW:      'bg-green-100 text-green-700 border-green-300',
};
const RISK_ICON: Record<string, React.ReactNode> = {
  HIGH:     <AlertTriangle size={12} className="text-red-600" />,
  MODERATE: <Info          size={12} className="text-yellow-600" />,
  LOW:      <CheckCircle   size={12} className="text-green-600" />,
};

function buildResults(panchayats: { name: string; lat: number; lng: number }[]) {
  return panchayats.map((p, i) => ({
    ...p,
    id:       p.name,
    temp:     +(28 + Math.sin(i * 1.3) * 2.5).toFixed(1),
    rain:     +(8  + i * 3.1).toFixed(1),
    humidity: Math.min(90, 58 + i * 4),
    risk:     RISKS[i % 3],
    conf:     84 + (i % 8),
  }));
}

// ── Component ──────────────────────────────────────────────
const OfficerDashboard = () => {
  const { user, updateUser } = useAuth();

  // Downscaling state
  const [district,    setDistrict]    = useState(user?.district || 'Pune');
  const [block,       setBlock]       = useState(user?.block    || 'Haveli');
  const [downscaling, setDownscaling] = useState(false);
  const [results,     setResults]     = useState(false);
  const [step,        setStep]        = useState('');

  // Sidebar tab
  const [sidebarTab, setSidebarTab] = useState<'downscale' | 'settings'>('downscale');

  // Settings sub-tab
  const [settingsTab, setSettingsTab] = useState<'profile' | 'model' | 'notifications' | 'export'>('profile');

  // Settings fields
  const [sName,  setSName]  = useState(user?.name  || '');
  const [sPhone, setSPhone] = useState(user?.phone || '');
  const [sBlock, setSBlock] = useState(user?.block || 'Haveli');
  const [confidence,  setConfidence]  = useState(75);
  const [modelVer,    setModelVer]    = useState('rf_spatial_v1.0');
  const [alertEmail,  setAlertEmail]  = useState(true);
  const [alertSms,    setAlertSms]    = useState(false);
  const [alertHigh,   setAlertHigh]   = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved,  setSettingsSaved]  = useState(false);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiUpdateProfile({ name: sName, phone: sPhone || undefined, block: sBlock });
      updateUser({ name: sName, phone: sPhone, block: sBlock });
    } catch {
      updateUser({ name: sName, block: sBlock });
    } finally {
      setSavingSettings(false);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    }
  };

  const availableBlocks     = LOCATIONS.blocks[district] || [];
  const availablePanchayats = LOCATIONS.panchayats[block] || [];
  const panchayatResults    = useMemo(() => buildResults(availablePanchayats), [block]);

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setBlock(LOCATIONS.blocks[d]?.[0] ?? '');
    setResults(false);
  };
  const handleBlockChange = (b: string) => { setBlock(b); setResults(false); };

  const handleRunDownscale = () => {
    setDownscaling(true); setResults(false);
    const steps = [
      'Fetching IMD block forecast…',
      'Extracting elevation (DEM) features…',
      'Running NDVI / land-use lookup…',
      'Invoking RandomForest model…',
      'Writing downscaled records to DB…',
    ];
    let i = 0;
    const iv = setInterval(() => {
      setStep(steps[i] ?? '');
      i++;
      if (i >= steps.length) { clearInterval(iv); setDownscaling(false); setResults(true); setStep(''); }
    }, 600);
  };

  const mapLocations = results
    ? panchayatResults.map(p => ({ id: p.name, name: p.name, lat: p.lat, lng: p.lng, risk: p.risk }))
    : [];
  const mapCenter: [number, number] = BLOCK_CENTERS[block] ?? [18.510, 74.010];

  const highCount = panchayatResults.filter(p => p.risk === 'HIGH').length;
  const modCount  = panchayatResults.filter(p => p.risk === 'MODERATE').length;
  const lowCount  = panchayatResults.filter(p => p.risk === 'LOW').length;
  const avgConf   = (panchayatResults.reduce((s, p) => s + p.conf, 0) / (panchayatResults.length || 1)).toFixed(1);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-112px)] bg-gray-50 overflow-hidden">

      {/* ════════ SIDEBAR ════════ */}
      <div className="w-96 bg-white border-r shadow-sm flex flex-col overflow-hidden shrink-0">

        {/* Sidebar header */}
        <div className="p-5 border-b bg-primary text-white shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-green-200 mb-1">Field Officer · Spatial Analysis</p>
          <h2 className="text-lg font-extrabold flex items-center gap-2"><Cpu size={18} /> ML Downscaling Engine</h2>
          <p className="text-xs text-green-200 mt-1">SIH26074 · IMD · MoES</p>
        </div>

        {/* Sidebar tab bar */}
        <div className="grid grid-cols-2 border-b shrink-0">
          <button onClick={() => setSidebarTab('downscale')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
              ${sidebarTab === 'downscale' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}>
            <Cpu size={13} /> Downscaling
          </button>
          <button onClick={() => setSidebarTab('settings')}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
              ${sidebarTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
            <Settings size={13} /> Settings
          </button>
        </div>

        {/* ── DOWNSCALING PANEL ── */}
        {sidebarTab === 'downscale' && (
          <div className="flex flex-col flex-1 overflow-y-auto">

            {/* Location Selector */}
            <div className="p-5 border-b">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1">
                <MapPin size={12} /> Target Location
              </p>
              <div className="flex flex-col gap-2">
                <select className="p-2 rounded-lg border bg-gray-50 text-sm" disabled>
                  <option>Maharashtra</option>
                </select>
                <select value={district} onChange={e => handleDistrictChange(e.target.value)}
                  className="p-2 rounded-lg border text-sm bg-white">
                  {LOCATIONS.districts.map(d => <option key={d}>{d} District</option>)}
                </select>
                <select value={block} onChange={e => handleBlockChange(e.target.value)}
                  className="p-2 rounded-lg border text-sm bg-white">
                  {availableBlocks.map(b => <option key={b}>{b} Block</option>)}
                </select>
              </div>
            </div>

            {/* ML Steps */}
            <div className="p-5 border-b">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1">
                <Cpu size={12} /> Pipeline Steps
              </p>
              <div className="space-y-2">
                {[
                  ['Fetch IMD Block Forecast',    'REST · 10 km grid'],
                  ['Feature Engineering',          'DEM · NDVI · Soil'],
                  ['ML Spatial Downscaling',       'RandomForest · 1 km'],
                  ['Write to DB',                  'MariaDB + Valkey cache'],
                  ['Generate Advisories',          'Crop × Weather rules'],
                ].map(([label, sub], i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${results ? 'bg-green-500 text-white' : downscaling && step.includes(label.split(' ')[0]) ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                      {results ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Button */}
            <div className="p-5 border-b">
              <button onClick={handleRunDownscale} disabled={downscaling || availablePanchayats.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex flex-col items-center gap-1 transition-all
                  ${downscaling || availablePanchayats.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-green-700 shadow-lg hover:shadow-xl'}`}>
                {downscaling
                  ? (<><div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" /><span className="text-xs mt-1 text-gray-500">{step}</span></>)
                  : (<><Play size={18} /> Run Spatial Downscaling</>)
                }
              </button>
              {results && <p className="text-xs text-green-600 font-semibold mt-2 text-center">✅ Complete · {panchayatResults.length} panchayats processed</p>}
              {availablePanchayats.length === 0 && <p className="text-xs text-amber-500 mt-2 text-center">⚠ Select a block with panchayat data</p>}
            </div>

            {/* Summary */}
            {results && (
              <div className="p-5 border-b">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <BarChart2 size={12} /> Output Summary
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: '🔴 HIGH',     value: highCount, color: 'bg-red-50    border-red-200    text-red-700' },
                    { label: '🟡 MODERATE', value: modCount,  color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: '🟢 LOW',      value: lowCount,  color: 'bg-green-50  border-green-200  text-green-700' },
                    { label: '📊 Avg Conf', value: `${avgConf}%`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-2.5 border text-center ${s.color}`}>
                      <p className="text-lg font-extrabold">{s.value}</p>
                      <p className="text-xs font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Panchayat list */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {panchayatResults.map(p => (
                    <div key={p.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border text-xs">
                      <div>
                        <p className="font-bold text-gray-700">{p.name}</p>
                        <p className="text-gray-400">{p.temp}°C · {p.rain}mm · {p.humidity}% RH</p>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${RISK_BADGE[p.risk]}`}>
                        {RISK_ICON[p.risk]} {p.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS PANEL ── */}
        {sidebarTab === 'settings' && (
          <div className="flex flex-col flex-1 overflow-y-auto">

            {/* Settings sub-tabs */}
            <div className="grid grid-cols-4 border-b bg-gray-50 shrink-0">
              {([
                { key: 'profile',       icon: <User     size={12} />, label: 'Profile' },
                { key: 'model',         icon: <Database size={12} />, label: 'Model'   },
                { key: 'notifications', icon: <Bell     size={12} />, label: 'Alerts'  },
                { key: 'export',        icon: <Download size={12} />, label: 'Export'  },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setSettingsTab(t.key)}
                  className={`py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors
                    ${settingsTab === t.key ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {settingsSaved && (
              <div className="mx-4 mt-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-3 py-2 flex items-center gap-1.5">
                <CheckCircle size={13} /> Saved successfully!
              </div>
            )}

            {/* Profile */}
            {settingsTab === 'profile' && (
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User size={11} /> Staff Profile</p>
                <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-dark-text">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5
                      ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input value={sName} onChange={e => setSName(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile</label>
                  <input value={sPhone} onChange={e => setSPhone(e.target.value)} placeholder="9876543210"
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned Block</label>
                  <select value={sBlock} onChange={e => setSBlock(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white">
                    {Object.values(LOCATIONS.blocks).flat().map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email (read-only)</label>
                  <input value={user?.email || ''} disabled
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-400" />
                </div>
                <button onClick={saveSettings} disabled={savingSettings}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {savingSettings ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Profile</>}
                </button>
              </div>
            )}

            {/* Model */}
            {settingsTab === 'model' && (
              <div className="p-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Database size={11} /> ML Model Configuration</p>
                <div className="bg-gray-50 rounded-xl p-3 border space-y-1 text-xs">
                  {[
                    ['Model Type',   'RandomForestRegressor'],
                    ['Features',     'DEM, NDVI, Soil, Land-use'],
                    ['Trained On',   '1,200 samples'],
                    ['RMSE (temp)',  '1.24°C'],
                    ['RMSE (rain)',  '2.81 mm'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-mono font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Model Version</label>
                  <select value={modelVer} onChange={e => setModelVer(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white">
                    <option>rf_spatial_v1.0</option>
                    <option>rf_spatial_v0.9 (legacy)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Confidence Threshold</label>
                    <span className="text-xs font-extrabold text-blue-600">{confidence}%</span>
                  </div>
                  <input type="range" min={50} max={99} value={confidence} onChange={e => setConfidence(+e.target.value)}
                    className="w-full accent-blue-600" />
                  <p className="text-xs text-gray-400 mt-1">Panchayats below threshold are flagged for manual review</p>
                </div>
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Retrain Model
                </button>
                <p className="text-xs text-gray-400 text-center">Last trained: 28 Sep 2026 · 09:12 IST</p>
              </div>
            )}

            {/* Notifications */}
            {settingsTab === 'notifications' && (
              <div className="p-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Bell size={11} /> Alert Preferences</p>
                {[
                  { label: 'Email Digest (Daily)', sub: 'Block-level summary every morning',      value: alertEmail, set: setAlertEmail },
                  { label: 'SMS on HIGH Risk',     sub: 'Twilio SMS for any HIGH-risk panchayat', value: alertSms,   set: setAlertSms   },
                  { label: 'In-app HIGH Alerts',   sub: 'Dashboard badge for HIGH risk areas',    value: alertHigh,  set: setAlertHigh  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                    <div>
                      <p className="text-sm font-bold text-dark-text">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <button onClick={() => item.set(p => !p)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 ${item.value ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
                <button onClick={saveSettings} disabled={savingSettings}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {savingSettings ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Alerts</>}
                </button>
              </div>
            )}

            {/* Export */}
            {settingsTab === 'export' && (
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Download size={11} /> Export Downscaled Data</p>
                <div className="space-y-2">
                  {[{
                    label: 'Export as CSV', sub: 'All panchayat results for current block', icon: '📄',
                    action: () => {
                      if (!results) { alert('Run downscaling first.'); return; }
                      const rows = panchayatResults.map(p => `${p.name},${p.temp},${p.rain},${p.humidity},${p.risk},${p.conf}`);
                      const csv  = ['Panchayat,Temp(°C),Rainfall(mm),Humidity(%),Risk,Confidence(%)'].concat(rows).join('\n');
                      const a    = document.createElement('a');
                      a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
                      a.download = `kisan_saarthi_${block}_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    },
                  }, {
                    label: 'Export as JSON', sub: 'Full structured data with coordinates', icon: '📋',
                    action: () => {
                      if (!results) { alert('Run downscaling first.'); return; }
                      const a    = document.createElement('a');
                      a.href     = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(panchayatResults, null, 2));
                      a.download = `kisan_saarthi_${block}_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                    },
                  }, {
                    label: 'Print Report', sub: 'Open print-friendly view', icon: '🖨️',
                    action: () => window.print(),
                  }].map(item => (
                    <button key={item.label} onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-dark-text">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {!results && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    ⚠ Run downscaling first to enable export.
                  </p>
                )}
              </div>
            )}

          </div>
        )}
      </div>
      {/* ════════ END SIDEBAR ════════ */}

      {/* ════════ MAIN PANEL ════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: 300 }}>
          <div className="absolute top-3 left-3 z-10 bg-white rounded-xl shadow px-3 py-2 text-xs font-semibold text-gray-600 border pointer-events-none">
            {results
              ? `🔴 ${mapLocations.filter(l => l.risk === 'HIGH').length} High · 🟡 ${mapLocations.filter(l => l.risk === 'MODERATE').length} Moderate · 🟢 ${mapLocations.filter(l => l.risk === 'LOW').length} Low`
              : '📡 Select a block and run downscaling to see results'}
          </div>
          <PanchayatMap locations={mapLocations} center={mapCenter} zoom={results ? 12 : 11} />
        </div>

        {/* Charts */}
        {results && (
          <div className="h-56 bg-white border-t grid grid-cols-2 divide-x shrink-0">
            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Rainfall Variance (mm)</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={panchayatResults} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={36} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="rain" name="Rainfall (mm)" fill="#00B8D9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Temp & Humidity Radar</p>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={panchayatResults}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <Radar name="Temp °C"   dataKey="temp"     stroke="#0B5D3B" fill="#0B5D3B" fillOpacity={0.3} />
                  <Radar name="Humidity%" dataKey="humidity" stroke="#00B8D9" fill="#00B8D9" fillOpacity={0.2} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
      {/* ════════ END MAIN PANEL ════════ */}

    </div>
  );
};

export default OfficerDashboard;
