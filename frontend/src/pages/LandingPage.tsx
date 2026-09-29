import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, Map as MapIcon, Sprout, ShieldAlert, ArrowRight, Cpu, Database, Globe, FlaskConical, ExternalLink } from 'lucide-react';

const COUNTDOWN_DATE = new Date('2026-09-30T23:59:00+05:30');

function DeadlineCountdown() {
  const now  = new Date();
  const diff = COUNTDOWN_DATE.getTime() - now.getTime();
  if (diff <= 0) return <span className="text-red-400 font-bold">Submission Closed</span>;
  const hours   = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return <span className="font-mono font-bold text-yellow-300">{hours}h {minutes}m remaining</span>;
}

const LandingPage = () => (
  <div className="flex flex-col items-center">

    {/* ── Hero ── */}
    <section className="w-full bg-gradient-to-br from-[#0B3D1E] via-[#0B5D3B] to-[#1a7a4a] text-white py-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
           style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          SIH 2026 · Problem Statement <strong>SIH26074</strong>
          <span className="ml-2 border-l border-white/30 pl-2"><DeadlineCountdown /></span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">Kisan Saarthi</h1>
        <p className="text-xl font-light text-green-100 mb-2">Block → Panchayat Weather Downscaling for Agro-Meteorological Advisory</p>
        <p className="text-sm opacity-70 mb-10 max-w-3xl mx-auto leading-relaxed">
          Inferring high-resolution weather data from IMD block-level forecasts using ML spatial downscaling, delivering crop-specific advisories at gram panchayat level.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/staff/login" className="bg-white text-primary px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Run Downscaling Demo <ArrowRight size={18}/>
          </Link>
          <Link to="/farmer/login" className="bg-white/10 border border-white/30 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
            Farmer Advisory <Sprout size={18}/>
          </Link>
        </div>
      </div>
    </section>

    {/* ── Org Strip ── */}
    <section className="w-full bg-amber-50 border-y border-amber-200 py-6 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        {[
          { label: 'Organization', value: 'Ministry of Earth Sciences (MoES)', icon: '🏛️' },
          { label: 'Department',   value: 'India Meteorological Department',   icon: '🌦️' },
          { label: 'Category',     value: 'Software',                          icon: '💻' },
          { label: 'Theme',        value: 'Agriculture & Rural Development',   icon: '🌾' },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{item.label}</span>
            <span className="font-bold text-gray-800 text-xs leading-tight">{item.value}</span>
          </div>
        ))}
      </div>
    </section>

    {/* ── Pipeline ── */}
    <section className="py-20 px-6 max-w-6xl mx-auto w-full">
      <div className="text-center mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Core Pipeline</span>
        <h2 className="text-3xl font-extrabold mt-3 text-dark-text">How Downscaling Works</h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm">
          Spatial ML models infer Panchayat microclimate from block-level IMD data using elevation, NDVI, and land-use features.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-2">
        {[
          { icon: <CloudRain size={32} className="text-blue-500"/>, label: 'IMD Block Forecast', sub: 'Low-res 10 km grid data', color: 'border-blue-200 bg-blue-50' },
          { icon: <Database size={32} className="text-purple-500"/>, label: 'Feature Engineering', sub: 'DEM, NDVI, soil, land-use', color: 'border-purple-200 bg-purple-50' },
          { icon: <Cpu size={32} className="text-primary"/>, label: 'ML Downscaling', sub: 'RandomForest spatial model', color: 'border-primary/30 bg-primary/5 ring-2 ring-primary/30' },
          { icon: <MapIcon size={32} className="text-cyan-600"/>, label: 'Panchayat Grid', sub: 'High-res ~1 km variables', color: 'border-cyan-200 bg-cyan-50' },
          { icon: <ShieldAlert size={32} className="text-orange-500"/>, label: 'Agro Advisory', sub: 'Crop alerts via SMS/app', color: 'border-orange-200 bg-orange-50' },
        ].map((step, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center gap-1 flex-1">
            <div className={`border-2 rounded-2xl p-4 flex flex-col items-center text-center gap-2 w-full ${step.color}`}>
              {step.icon}
              <p className="font-bold text-sm text-dark-text">{step.label}</p>
              <p className="text-xs text-gray-500">{step.sub}</p>
            </div>
            {i < 4 && <ArrowRight className="hidden md:block text-gray-200 shrink-0 mx-0.5" size={20}/>}
          </div>
        ))}
      </div>
    </section>

    {/* ── Features Grid ── */}
    <section className="w-full bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Features</span>
          <h2 className="text-3xl font-extrabold mt-3 text-dark-text">What Kisan Saarthi Delivers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon:'🗺️', title:'Spatial Downscaling', desc:'Converts IMD block data (10 km) to Panchayat resolution (1 km) using Scikit-Learn RandomForest trained on elevation, NDVI & land-use.' },
            { icon:'🌾', title:'My Crops Advisory',   desc:'Farmers select their crops, get weather-specific tips for HIGH/MODERATE/LOW risk conditions across 12 crop types.' },
            { icon:'⚙️', title:'Settings & Location', desc:'Full profile management with cascading State → District → Block → Panchayat selector, language & SMS preferences.' },
            { icon:'📱', title:'Farmer-First UI',     desc:'Simple multilingual (EN/HI/MR) dashboard for low-connectivity farmers — today\'s weather and one clear action.' },
            { icon:'📡', title:'SMS via Twilio',      desc:'HIGH-risk advisories auto-sent to registered farmer mobiles in local language even without internet.' },
            { icon:'🔐', title:'Secure Auth',         desc:'bcrypt hashed passwords, JWT tokens, 7-day sessions persisted in localStorage with role-based portals.' },
          ].map(f => (
            <div key={f.title} className="glass-card p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-dark-text mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Tech Stack ── */}
    <section className="py-16 px-6 max-w-6xl mx-auto w-full">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Built With</span>
        <h2 className="text-3xl font-extrabold mt-3 text-dark-text">Modern Tech Stack</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label:'Frontend',       value:'React.js · Tailwind CSS · i18next · Vite',          icon:<Globe size={18} className="text-blue-500"/> },
          { label:'Backend',        value:'Python · FastAPI · SQLAlchemy · MariaDB · Valkey',  icon:<Database size={18} className="text-green-600"/> },
          { label:'AI / ML',        value:'Scikit-learn · Pandas · NumPy · Jupyter',           icon:<Cpu size={18} className="text-purple-500"/> },
          { label:'Security',       value:'JWT · bcrypt · OAuth 2.0 · Firebase Auth',          icon:<FlaskConical size={18} className="text-red-500"/> },
          { label:'Cloud & Deploy', value:'AWS · Vercel · Google Cloud · Docker',              icon:<CloudRain size={18} className="text-cyan-500"/> },
          { label:'Services',       value:'Firebase · Twilio SMS · OpenStreetMap (Leaflet)',   icon:<ShieldAlert size={18} className="text-orange-500"/> },
        ].map(t => (
          <div key={t.label} className="glass-card p-4 flex items-start gap-3 hover:shadow-lg transition-shadow">
            <div className="mt-0.5 p-2 bg-gray-100 rounded-lg shrink-0">{t.icon}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{t.label}</p>
              <p className="text-sm font-semibold text-dark-text leading-snug">{t.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="w-full bg-primary text-white py-14 px-6 text-center">
      <h2 className="text-3xl font-extrabold mb-2">Try the Live Demo</h2>
      <p className="text-green-200 mb-8 max-w-xl mx-auto text-sm">
        Two separate portals: Farmer dashboard with My Crops advisory, and Staff portal with live ML downscaling map.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/farmer/login" className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Sprout size={16}/> Farmer Portal
        </Link>
        <Link to="/staff/login" className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
          <ExternalLink size={16}/> Staff Portal
        </Link>
      </div>
    </section>
  </div>
);

export default LandingPage;
