import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets, Wind, Thermometer, CloudRain,
  AlertTriangle, CheckCircle, Info, Leaf, Settings,
  ArrowRight, Sun, CloudDrizzle
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

// ── Mock weather keyed by panchayat (simulates ML downscaled output) ──
const PANCHAYAT_WEATHER: Record<string, any> = {
  'Uruli Kanchan': { temp: 29.4, tempMax: 33.1, tempMin: 23.8, rainfall: 18.2, humidity: 78, wind: 14.5, soilMoisture: 42.1, rainfallProb: 85, condition: 'Rainy' },
  'Wagholi':       { temp: 31.1, tempMax: 34.5, tempMin: 25.2, rainfall: 9.5,  humidity: 62, wind: 11.0, soilMoisture: 32.0, rainfallProb: 45, condition: 'Partly Cloudy' },
  'Loni Kalbhor':  { temp: 28.6, tempMax: 32.0, tempMin: 23.1, rainfall: 14.0, humidity: 71, wind: 13.0, soilMoisture: 38.5, rainfallProb: 70, condition: 'Cloudy' },
  'Theur':         { temp: 30.9, tempMax: 35.0, tempMin: 24.8, rainfall: 7.1,  humidity: 60, wind: 9.5,  soilMoisture: 28.0, rainfallProb: 30, condition: 'Sunny' },
  'Kunjirwadi':    { temp: 27.8, tempMax: 31.5, tempMin: 22.5, rainfall: 21.5, humidity: 82, wind: 16.0, soilMoisture: 48.0, rainfallProb: 92, condition: 'Heavy Rain' },
  'Pirangut':      { temp: 26.5, tempMax: 30.0, tempMin: 21.0, rainfall: 25.0, humidity: 85, wind: 18.0, soilMoisture: 55.0, rainfallProb: 95, condition: 'Heavy Rain' },
};
const DEFAULT_WEATHER = { temp: 29.0, tempMax: 33.0, tempMin: 23.0, rainfall: 12.0, humidity: 68, wind: 12.0, soilMoisture: 35.0, rainfallProb: 60, condition: 'Partly Cloudy' };

const SEVEN_DAY = [
  { day: 'Today', temp: 29.4, rain: 18.2, prob: 85 },
  { day: 'Tue',   temp: 31.1, rain: 2.0,  prob: 20 },
  { day: 'Wed',   temp: 28.6, rain: 10.5, prob: 65 },
  { day: 'Thu',   temp: 26.3, rain: 22.1, prob: 88 },
  { day: 'Fri',   temp: 25.9, rain: 5.0,  prob: 35 },
  { day: 'Sat',   temp: 27.0, rain: 0.0,  prob: 10 },
  { day: 'Sun',   temp: 30.2, rain: 1.5,  prob: 15 },
];

const ADVISORIES = [
  { id: 1, crop: 'Soybean', emoji: '🫘', risk: 'HIGH',
    reason: 'Rainfall 18.2 mm exceeds critical threshold during flowering stage.',
    action: 'Clear drainage channels immediately. Avoid irrigation and fertiliser application. Watch for stem rot.',
    valid: 'Next 24 hours' },
  { id: 2, crop: 'Sugarcane', emoji: '🎋', risk: 'MODERATE',
    reason: 'High humidity (78%) increases red-rot fungal infection risk.',
    action: 'Apply Carbendazim drench on root zone. Monitor stalk colour for early symptoms.',
    valid: 'Next 48 hours' },
  { id: 3, crop: 'Wheat', emoji: '🌾', risk: 'LOW',
    reason: 'Conditions near-optimal. Mild wind aids natural pollination.',
    action: 'No immediate action. Schedule nitrogen top-dressing if tillering stage.',
    valid: 'Next 72 hours' },
];

const RISK_STYLE: Record<string, string> = {
  HIGH:     'border-red-500 bg-red-50',
  MODERATE: 'border-yellow-500 bg-yellow-50',
  LOW:      'border-green-500 bg-green-50',
};
const RISK_TEXT: Record<string, string>  = { HIGH: 'text-red-700', MODERATE: 'text-yellow-700', LOW: 'text-green-700' };
const RISK_ICON: Record<string, any>     = {
  HIGH:     <AlertTriangle size={16} className="text-red-600" />,
  MODERATE: <Info size={16} className="text-yellow-600" />,
  LOW:      <CheckCircle size={16} className="text-green-600" />,
};

const conditionIcon: Record<string, any> = {
  'Rainy':         <CloudRain size={28} className="text-blue-400" />,
  'Heavy Rain':    <CloudDrizzle size={28} className="text-blue-600" />,
  'Cloudy':        <CloudRain size={28} className="text-gray-400" />,
  'Partly Cloudy': <Sun size={28} className="text-yellow-400" />,
  'Sunny':         <Sun size={28} className="text-orange-400" />,
};

// ── Component ──────────────────────────────────────────────
const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [openAdv, setOpenAdv]     = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  const panchayat = user?.panchayat_name || user?.panchayat || '';
  const weather   = PANCHAYAT_WEATHER[panchayat] || DEFAULT_WEATHER;
  const today     = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      <p className="text-sm text-gray-400">Loading downscaled panchayat forecast…</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-primary font-bold uppercase tracking-widest">
            IMD Downscaled · Agro-Met Advisory
          </p>
          <h1 className="text-2xl font-extrabold text-dark-text">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            📍 {panchayat ? `${panchayat} Panchayat` : 'Set your location in Settings'}, {user?.block || ''} Block &nbsp;·&nbsp; {today}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/farmer/crops" className="flex items-center gap-1.5 bg-green-100 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors">
            <Leaf size={15}/> My Crops
          </Link>
          <Link to="/farmer/settings" className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
            <Settings size={15}/> Settings
          </Link>
        </div>
      </div>

      {/* ── Source Badge ── */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-xs text-blue-700">
        <span className="font-bold">📡 Data Source:</span>
        IMD Block Forecast ({user?.block || 'Haveli'}) → ML Spatial Downscaling → {panchayat || 'Panchayat'} microclimate
        <span className="ml-auto font-bold text-primary">Model v1.0 · Confidence: 87%</span>
      </div>

      {/* ── Current Weather Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Thermometer className="text-orange-500" size={24}/>, label: 'Temperature', value: `${weather.temp}°C`, sub: `↑${weather.tempMax}° ↓${weather.tempMin}°` },
          { icon: <CloudRain className="text-blue-500" size={24}/>, label: 'Rainfall', value: `${weather.rainfall} mm`, sub: `${weather.rainfallProb}% probability` },
          { icon: <Droplets className="text-cyan-500" size={24}/>, label: 'Humidity', value: `${weather.humidity}%`, sub: 'Relative Humidity' },
          { icon: <Wind className="text-gray-400" size={24}/>, label: 'Wind', value: `${weather.wind} km/h`, sub: 'SW direction' },
        ].map(c => (
          <div key={c.label} className="glass-card p-4 flex flex-col items-center text-center gap-1">
            {c.icon}
            <span className="text-xl font-extrabold">{c.value}</span>
            <span className="text-xs text-gray-400">{c.label}</span>
            <span className="text-xs text-gray-400">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Soil Moisture + Condition ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Soil Moisture</p>
              <p className="text-3xl font-extrabold text-primary">{weather.soilMoisture}%</p>
              <p className="text-xs text-gray-400">Estimated from downscaled rainfall</p>
            </div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${weather.soilMoisture > 45 ? 'bg-blue-100 text-blue-700' : weather.soilMoisture > 30 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {weather.soilMoisture > 45 ? 'Saturated' : weather.soilMoisture > 30 ? 'Adequate' : 'Low'}
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-primary transition-all duration-700"
                 style={{ width: `${weather.soilMoisture}%` }} />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="text-5xl">{conditionIcon[weather.condition] || <CloudRain size={48} />}</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Condition</p>
            <p className="text-2xl font-extrabold text-dark-text">{weather.condition}</p>
            <p className="text-xs text-gray-400 mt-1">
              {weather.rainfallProb}% chance of rain · Feels like {(weather.temp + 2).toFixed(1)}°C
            </p>
          </div>
        </div>
      </div>

      {/* ── 7-Day Forecast Strip ── */}
      <div className="glass-card p-5">
        <h2 className="font-extrabold text-dark-text mb-4">7-Day Forecast</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SEVEN_DAY.map((d, i) => (
            <button key={i} onClick={() => setActiveDay(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[72px] transition-all border-2
                ${activeDay === i ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
              <p className="text-xs font-bold">{d.day}</p>
              <div className="text-lg">{d.rain > 15 ? '🌧' : d.rain > 5 ? '🌦' : '☀️'}</div>
              <p className="text-sm font-extrabold">{d.temp}°</p>
              <p className={`text-xs font-semibold ${activeDay === i ? 'text-blue-200' : 'text-blue-500'}`}>{d.rain}mm</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Advisories ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-extrabold">Active Advisories</h2>
          <span className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full">
            1 HIGH RISK
          </span>
        </div>
        <div className="space-y-3">
          {ADVISORIES.map(adv => (
            <div key={adv.id}
              className={`border-l-4 rounded-r-2xl shadow-sm overflow-hidden ${RISK_STYLE[adv.risk]}`}>
              <button className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setOpenAdv(openAdv === adv.id ? null : adv.id)}>
                <div className="flex items-center gap-3">
                  {RISK_ICON[adv.risk]}
                  <div>
                    <p className={`font-extrabold text-sm ${RISK_TEXT[adv.risk]}`}>
                      {adv.emoji} {adv.crop} — {adv.risk} RISK
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{adv.reason}</p>
                  </div>
                </div>
                <ArrowRight size={16} className={`text-gray-400 transition-transform ${openAdv === adv.id ? 'rotate-90' : ''}`}/>
              </button>
              {openAdv === adv.id && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="bg-white/70 rounded-xl p-3 border text-sm">
                    <p className="font-bold text-gray-700 mb-1">✅ Recommended Action:</p>
                    <p className="text-gray-700">{adv.action}</p>
                  </div>
                  <p className="text-xs text-gray-400">⏱ Valid: {adv.valid}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="glass-card p-5">
        <h2 className="font-extrabold mb-1">7-Day Temperature & Rainfall Trend</h2>
        <p className="text-xs text-gray-400 mb-4">Downscaled forecast for {panchayat || 'your panchayat'}</p>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={SEVEN_DAY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="t" domain={[20, 38]} unit="°" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="r" orientation="right" domain={[0, 35]} unit="mm" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any, n: string) => [n === 'temp' ? `${v}°C` : `${v}mm`, n === 'temp' ? 'Temperature' : 'Rainfall']} />
            <Legend />
            <Bar  yAxisId="r" dataKey="rain" name="Rainfall (mm)" fill="#93C5FD" radius={[4,4,0,0]} opacity={0.8} />
            <Line yAxisId="t" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#0B5D3B" strokeWidth={3} dot={{ r: 4, fill: '#0B5D3B' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <Link to="/farmer/crops" className="glass-card p-5 flex items-center gap-3 hover:shadow-xl transition-shadow group">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Leaf size={24} className="text-primary"/>
          </div>
          <div>
            <p className="font-bold text-dark-text">My Crops</p>
            <p className="text-xs text-gray-400">Personalized tips & advisories</p>
          </div>
          <ArrowRight size={16} className="text-gray-300 ml-auto"/>
        </Link>
        <Link to="/farmer/settings" className="glass-card p-5 flex items-center gap-3 hover:shadow-xl transition-shadow group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <Settings size={24} className="text-gray-600"/>
          </div>
          <div>
            <p className="font-bold text-dark-text">Settings</p>
            <p className="text-xs text-gray-400">Location, profile & alerts</p>
          </div>
          <ArrowRight size={16} className="text-gray-300 ml-auto"/>
        </Link>
      </div>

    </div>
  );
};

export default FarmerDashboard;
