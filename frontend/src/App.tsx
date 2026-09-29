import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState } from 'react';

// Pages
import PortalSelector   from './pages/PortalSelector';
import FarmerLoginPage  from './pages/FarmerLoginPage';
import StaffLoginPage   from './pages/StaffLoginPage';
import FarmerDashboard  from './pages/FarmerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import FarmerSettings   from './pages/FarmerSettings';
import MyCrops          from './pages/MyCrops';

import { Sprout, Shield, LogOut, ChevronDown, User, Settings, Leaf } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Farmer Layout — green branded nav
// ─────────────────────────────────────────────────────────────
function FarmerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const [drop, setDrop] = useState(false);
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path
      ? 'bg-white/20 rounded-lg px-2 py-1'
      : 'hover:bg-white/10 rounded-lg px-2 py-1 transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* IMD strip */}
      <div className="bg-green-950 text-green-200 text-xs py-1 px-4 flex justify-between">
        <span>🇮🇳 Ministry of Earth Sciences · India Meteorological Department</span>
        <span className="text-yellow-300 font-semibold">SIH26074 · Farmer Portal</span>
      </div>

      {/* Nav */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/farmer/dashboard" className="flex items-center gap-2 font-extrabold text-lg">
            <Sprout size={22} /> Kisan Saarthi
            <span className="text-xs font-normal text-green-200 ml-1">Farmer Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link to="/farmer/dashboard" className={isActive('/farmer/dashboard')}>🏠 Dashboard</Link>
            <Link to="/farmer/crops"     className={isActive('/farmer/crops')}>🌱 My Crops</Link>
            <Link to="/farmer/settings" className={isActive('/farmer/settings')}>⚙ Settings</Link>
          </nav>

          <div className="flex items-center gap-2">
            <select onChange={e => i18n.changeLanguage(e.target.value)} defaultValue="en"
              className="border border-white/30 rounded-lg px-2 py-1 bg-white/10 text-white text-sm cursor-pointer">
              <option value="en" className="text-black">English</option>
              <option value="hi" className="text-black">हिंदी</option>
              <option value="mr" className="text-black">मराठी</option>
            </select>

            {user && (
              <div className="relative">
                <button onClick={() => setDrop(p => !p)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 text-sm transition-all">
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center font-bold text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} />
                </button>
                {drop && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b rounded-t-2xl">
                      <p className="font-bold text-dark-text text-sm">{user.name}</p>
                      {user.panchayat && <p className="text-xs text-gray-400">📍 {user.panchayat}, {user.block}</p>}
                      <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full mt-1 inline-block">FARMER</span>
                    </div>
                    <Link to="/farmer/dashboard" onClick={() => setDrop(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={14} /> Dashboard
                    </Link>
                    <Link to="/farmer/crops" onClick={() => setDrop(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <Leaf size={14} /> My Crops
                    </Link>
                    <Link to="/farmer/settings" onClick={() => setDrop(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings size={14} /> Settings
                    </Link>
                    <button onClick={() => { logout(); setDrop(false); }}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full text-left rounded-b-2xl">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-green-950 text-green-400 py-4 px-4 text-center text-xs">
        <p className="text-white font-semibold">Kisan Saarthi · Farmer Portal · SIH26074</p>
        <p>Ministry of Earth Sciences · India Meteorological Department</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Staff Layout — blue branded nav
// ─────────────────────────────────────────────────────────────
function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [drop, setDrop] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* IMD strip */}
      <div className="bg-blue-950 text-blue-200 text-xs py-1 px-4 flex justify-between">
        <span>🇮🇳 Ministry of Earth Sciences · India Meteorological Department</span>
        <span className="text-yellow-300 font-semibold">SIH26074 · Staff Portal</span>
      </div>

      {/* Nav */}
      <header className="bg-blue-700 text-white shadow-md sticky top-0 z-[9999]" style={{isolation:'isolate'}}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/staff/dashboard" className="flex items-center gap-2 font-extrabold text-lg">
            <Shield size={22} /> Kisan Saarthi
            <span className="text-xs font-normal text-blue-200 ml-1">Staff Portal</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link to="/farmer/dashboard" className="text-blue-200 hover:text-white transition-colors text-xs">
              → Switch to Farmer View
            </Link>

            {user && (
              <div className="relative">
                <button onClick={() => setDrop(p => !p)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 transition-all">
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center font-bold text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} />
                </button>
                {drop && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border z-[10000]">
                    <div className="px-4 py-3 bg-gray-50 border-b rounded-t-2xl">
                      <p className="font-bold text-dark-text text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {user.block && <p className="text-xs text-gray-400">🗺 {user.block} Block</p>}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                        ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </div>
                    <button onClick={() => { logout(); setDrop(false); }}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full text-left rounded-b-2xl">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Protected Route wrappers
// ─────────────────────────────────────────────────────────────
function FarmerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/farmer/login" replace />;
  // Staff trying to access farmer route — still allow (they can view)
  return <FarmerLayout>{children}</FarmerLayout>;
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/staff/login" replace />;
  return <StaffLayout>{children}</StaffLayout>;
}

// ─────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────
function AppInner() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Portal selector */}
      <Route path="/" element={<PortalSelector />} />

      {/* Farmer portal */}
      <Route path="/farmer/login"
        element={isAuthenticated && user?.role === 'FARMER'
          ? <Navigate to="/farmer/dashboard" replace />
          : <FarmerLoginPage />} />
      <Route path="/farmer/dashboard"
        element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
      <Route path="/farmer/crops"
        element={<FarmerRoute><MyCrops /></FarmerRoute>} />
      <Route path="/farmer/settings"
        element={<FarmerRoute><FarmerSettings /></FarmerRoute>} />

      {/* Staff portal */}
      <Route path="/staff/login"
        element={isAuthenticated && user?.role !== 'FARMER'
          ? <Navigate to="/staff/dashboard" replace />
          : <StaffLoginPage />} />
      <Route path="/staff/dashboard"
        element={<StaffRoute><OfficerDashboard /></StaffRoute>} />

      {/* Legacy / catch-all */}
      <Route path="/farmer"  element={<Navigate to="/farmer/login"  replace />} />
      <Route path="/officer" element={<Navigate to="/staff/login"   replace />} />
      <Route path="*"        element={<Navigate to="/"              replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>
    </AuthProvider>
  );
}
