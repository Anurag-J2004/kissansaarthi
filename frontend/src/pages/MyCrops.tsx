import { useState, useEffect } from 'react';
import { apiGetCrops, apiAddCrop, apiDeleteCrop } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Sprout, Loader2, CloudRain, Thermometer, Droplets, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ── Crop knowledge base ────────────────────────────────────
const CROP_CATALOG = [
  { name: 'Soybean',   emoji: '🫘', season: 'Kharif', varieties: ['JS-335', 'MACS-58', 'NRC-7'] },
  { name: 'Rice',      emoji: '🍚', season: 'Kharif', varieties: ['BPT-5204', 'Sona Masuri', 'HMT'] },
  { name: 'Wheat',     emoji: '🌾', season: 'Rabi',   varieties: ['GW-322', 'HD-2781', 'NW-1014'] },
  { name: 'Cotton',    emoji: '🌿', season: 'Kharif', varieties: ['Bt Cotton', 'DCH-32', 'Hybrid'] },
  { name: 'Sugarcane', emoji: '🎋', season: 'Annual', varieties: ['Co-86032', 'VSI-434', 'MS-10001'] },
  { name: 'Onion',     emoji: '🧅', season: 'Rabi',   varieties: ['Nasik Red', 'Agrifound Light Red'] },
  { name: 'Tomato',    emoji: '🍅', season: 'Kharif', varieties: ['Arka Vikas', 'Roma', 'Pusa Ruby'] },
  { name: 'Groundnut', emoji: '🥜', season: 'Kharif', varieties: ['TAG-24', 'GG-20', 'JL-24'] },
  { name: 'Maize',     emoji: '🌽', season: 'Kharif', varieties: ['HM-4', 'Ganga-11', 'DHM-117'] },
  { name: 'Jowar',     emoji: '🌿', season: 'Kharif', varieties: ['CSV-15', 'SPH-1616', 'MSVK-1'] },
  { name: 'Tur/Arhar', emoji: '🫛', season: 'Kharif', varieties: ['BSMR-736', 'ICPL-88039'] },
  { name: 'Gram',      emoji: '🫛', season: 'Rabi',   varieties: ['Vijay', 'Phule G-5', 'JG-11'] },
];

interface CropTip {
  condition: string;
  icon: React.ReactNode;
  color: string;
  tips: string[];
}

function getCropWeatherTips(cropName: string, weather: typeof MOCK_WEATHER): CropTip[] {
  const tips: CropTip[] = [];
  const isHighRain = weather.rainfall > 15;
  const isHighHumidity = weather.humidity > 75;
  const isHighTemp = weather.temp > 32;

  if (isHighRain) {
    tips.push({
      condition: 'Heavy Rainfall Alert',
      icon: <CloudRain size={16} />,
      color: 'border-blue-400 bg-blue-50 text-blue-800',
      tips: cropRainTips[cropName] || ['Ensure field drainage is clear.', 'Avoid irrigation.', 'Delay any spray operations.'],
    });
  }
  if (isHighHumidity) {
    tips.push({
      condition: 'High Humidity — Disease Risk',
      icon: <Droplets size={16} />,
      color: 'border-yellow-400 bg-yellow-50 text-yellow-800',
      tips: cropHumidityTips[cropName] || ['Monitor for fungal infections.', 'Ensure good air circulation.'],
    });
  }
  if (isHighTemp) {
    tips.push({
      condition: 'High Temperature',
      icon: <Thermometer size={16} />,
      color: 'border-orange-400 bg-orange-50 text-orange-800',
      tips: cropHeatTips[cropName] || ['Provide adequate moisture.', 'Mulch to conserve soil moisture.'],
    });
  }
  if (tips.length === 0) {
    tips.push({
      condition: 'Good Growing Conditions',
      icon: <CheckCircle size={16} />,
      color: 'border-green-400 bg-green-50 text-green-800',
      tips: cropIdealTips[cropName] || ['Continue regular monitoring.', 'Conditions are near-optimal for growth.'],
    });
  }
  return tips;
}

const cropRainTips: Record<string, string[]> = {
  Soybean:   ['Inspect drainage channels — roots rot within 24h of waterlogging.', 'Do NOT apply fertiliser before rain.', 'Watch for stem rot; remove infected plants.'],
  Rice:      ['Maintain water level 5–7 cm; excess causes tillering issues.', 'Check bunds to prevent overflow damage.'],
  Wheat:     ['Avoid walking in field to prevent lodging.', 'Check for rust disease after rains.'],
  Cotton:    ['Drain excess water within 6h to prevent root rot.', 'Delay any spray for at least 48 hours.'],
  Onion:     ['Onion is highly sensitive to waterlogging — clear drainage urgently.', 'Delay harvesting until soil dries.'],
  Sugarcane: ['Heavy rain may cause lodging — stake or tie young canes.'],
  Tomato:    ['Check for fruit cracking after heavy rain.', 'Apply fungicide spray after rain stops.'],
  Groundnut: ['Excess moisture causes pod rot — drain field immediately.'],
};

const cropHumidityTips: Record<string, string[]> = {
  Soybean:   ['Scout for yellow mosaic virus symptoms (yellow patches on leaves).', 'Apply dimethoate if aphids visible.'],
  Cotton:    ['Watch for grey mildew on bolls.', 'Spray copper-based fungicide if infection >10%.'],
  Tomato:    ['Apply mancozeb 2g/L for late blight prevention.', 'Remove lower infected leaves.'],
  Wheat:     ['Scout for yellow rust (Puccinia striiformis) — yellow stripes on leaves.'],
  Rice:      ['Watch for blast disease at neck node — apply tricyclazole if needed.'],
  Onion:     ['Purple blotch is likely; apply iprodione or mancozeb.'],
  Sugarcane: ['High humidity aids red rot — apply Carbendazim as drench.'],
};

const cropHeatTips: Record<string, string[]> = {
  Soybean:   ['Irrigate before 8AM or after 5PM to minimise water stress.', 'Heat >35°C during flowering reduces pod set.'],
  Wheat:     ['Terminal heat stress during grain filling — ensure adequate moisture.', 'Spray 1% KNO3 to reduce heat stress.'],
  Onion:     ['High temp may cause premature bolting — monitor closely.'],
  Cotton:    ['High temps during boll formation may cause boll shedding.', 'Irrigate every 7–10 days.'],
};

const cropIdealTips: Record<string, string[]> = {
  Soybean:   ['Good conditions — ensure Rhizobium inoculation if not done.', 'Apply second dose of phosphorus fertiliser.'],
  Rice:      ['Maintain water level and apply nitrogen if tillering stage.'],
  Wheat:     ['Ideal for germination. Ensure seed-soil contact is good.'],
  Cotton:    ['Spray micronutrients if interveinal chlorosis visible.'],
  Onion:     ['Good conditions for bulb development — apply potash fertiliser.'],
};

const MOCK_WEATHER = { temp: 29.4, rainfall: 18.2, humidity: 78 };

const getRiskFromWeather = (cropName: string, w: typeof MOCK_WEATHER): 'HIGH' | 'MODERATE' | 'LOW' => {
  if (w.rainfall > 15 && ['Soybean', 'Onion', 'Groundnut'].includes(cropName)) return 'HIGH';
  if (w.humidity > 75 && ['Tomato', 'Cotton', 'Grape'].includes(cropName)) return 'MODERATE';
  return 'LOW';
};

const RISK_STYLE: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-300',
  MODERATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  LOW: 'bg-green-100 text-green-700 border-green-300',
};

// ── Component ──────────────────────────────────────────────
const MyCrops = () => {
  const { user } = useAuth();
  const [myCrops, setMyCrops]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(CROP_CATALOG[0].name);
  const [variety, setVariety]       = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [areaAcres, setAreaAcres]   = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeCrop, setActiveCrop] = useState<string | null>(null);

  useEffect(() => {
    apiGetCrops()
      .then(setMyCrops)
      .catch(() => setMyCrops([]))   // fallback if backend offline
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const newCrop = await apiAddCrop({
        crop_name: selectedCrop,
        variety: variety || undefined,
        sowing_date: sowingDate || undefined,
        area_acres: areaAcres ? parseFloat(areaAcres) : undefined,
      });
      setMyCrops(p => [...p, newCrop]);
      setShowAdd(false);
      setVariety(''); setSowingDate(''); setAreaAcres('');
    } catch {
      // Offline fallback
      setMyCrops(p => [...p, {
        id: Date.now().toString(), crop_name: selectedCrop,
        variety, sowing_date: sowingDate, area_acres: areaAcres ? parseFloat(areaAcres) : null,
      }]);
      setShowAdd(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await apiDeleteCrop(id); } catch {}
    setMyCrops(p => p.filter(c => c.id !== id));
    setDeletingId(null);
    if (activeCrop === id) setActiveCrop(null);
  };

  const catalog = CROP_CATALOG.find(c => c.name === selectedCrop);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-text">My Crops</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.panchayat_name || user?.panchayat || 'Your Panchayat'} · Personalised advisories based on your crops
          </p>
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
          <Plus size={16}/> Add Crop
        </button>
      </div>

      {/* ── Add Crop Panel ── */}
      {showAdd && (
        <div className="mb-6 bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-dark-text mb-4 flex items-center gap-2"><Sprout size={16}/> Add New Crop</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Crop</label>
              <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                {CROP_CATALOG.map(c => <option key={c.name}>{c.emoji} {c.name} ({c.season})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Variety</label>
              <select value={variety} onChange={e => setVariety(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="">-- Select Variety --</option>
                {(catalog?.varieties || []).map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sowing Date</label>
              <input type="date" value={sowingDate} onChange={e => setSowingDate(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Area (acres)</label>
              <input type="number" value={areaAcres} onChange={e => setAreaAcres(e.target.value)} placeholder="e.g. 2.5"
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60">
              {saving ? <><Loader2 size={14} className="animate-spin"/> Adding…</> : <><Plus size={14}/> Add Crop</>}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32}/></div>
      )}

      {!loading && myCrops.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <Sprout size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="font-bold text-gray-400">No crops added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your crops to get personalised weather tips and advisories</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all">
            + Add Your First Crop
          </button>
        </div>
      )}

      {/* ── Crop Cards ── */}
      <div className="space-y-4">
        {myCrops.map(crop => {
          const risk    = getRiskFromWeather(crop.crop_name, MOCK_WEATHER);
          const catInfo = CROP_CATALOG.find(c => c.name === crop.crop_name);
          const isOpen  = activeCrop === crop.id;
          const weatherTips = getCropWeatherTips(crop.crop_name, MOCK_WEATHER);

          return (
            <div key={crop.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={() => setActiveCrop(isOpen ? null : crop.id)}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{catInfo?.emoji || '🌿'}</div>
                  <div>
                    <p className="font-extrabold text-dark-text">{crop.crop_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {crop.variety && <span>Variety: {crop.variety}</span>}
                      {crop.sowing_date && <span>· Sown: {new Date(crop.sowing_date).toLocaleDateString('en-IN')}</span>}
                      {crop.area_acres && <span>· {crop.area_acres} acres</span>}
                      {catInfo && <span>· {catInfo.season}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${RISK_STYLE[risk]}`}>
                    {risk === 'HIGH' ? <AlertTriangle size={10} className="inline mr-1"/> : null}{risk} RISK
                  </span>
                  <button onClick={e => { e.stopPropagation(); handleDelete(crop.id); }}
                    disabled={deletingId === crop.id}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    {deletingId === crop.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                  </button>
                  <span className="text-gray-300 text-lg">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expandable Tips */}
              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs">
                    <p className="font-bold text-blue-700 mb-1">📡 Today's Weather · {user?.panchayat_name || 'Your Panchayat'}</p>
                    <div className="flex gap-4 text-blue-600">
                      <span>🌡 {MOCK_WEATHER.temp}°C</span>
                      <span>🌧 {MOCK_WEATHER.rainfall} mm</span>
                      <span>💧 {MOCK_WEATHER.humidity}% RH</span>
                    </div>
                  </div>

                  {weatherTips.map((tip, i) => (
                    <div key={i} className={`rounded-xl p-3 border-l-4 ${tip.color}`}>
                      <p className="font-bold text-sm flex items-center gap-2 mb-2">{tip.icon} {tip.condition}</p>
                      <ul className="space-y-1">
                        {tip.tips.map((t, j) => (
                          <li key={j} className="text-xs flex items-start gap-2">
                            <span className="mt-0.5 shrink-0">→</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* General crop info */}
                  {catInfo && (
                    <div className="bg-gray-50 rounded-xl p-3 border text-xs text-gray-600">
                      <p className="font-bold text-gray-700 mb-1">ℹ General Info — {crop.crop_name}</p>
                      <p>Season: <strong>{catInfo.season}</strong> &nbsp;|&nbsp; Available varieties: {catInfo.varieties.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCrops;
