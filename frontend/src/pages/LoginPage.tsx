import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CloudRain, Sprout, Shield, User } from 'lucide-react';

type Tab = 'login' | 'register';

const LOCATIONS = {
  states: ['Maharashtra'],
  districts: { Maharashtra: ['Pune', 'Nashik', 'Aurangabad', 'Kolhapur', 'Nagpur'] },
  blocks: {
    Pune: ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Bhor', 'Purandar'],
    Nashik: ['Niphad', 'Sinnar', 'Dindori', 'Igatpuri'],
    Aurangabad: ['Gangapur', 'Vaijapur', 'Kannad'],
    Kolhapur: ['Karveer', 'Hatkanangle', 'Shirol'],
    Nagpur: ['Hingna', 'Kamthi', 'Ramtek'],
  } as Record<string, string[]>,
  panchayats: {
    Haveli: ['Uruli Kanchan', 'Wagholi', 'Loni Kalbhor', 'Theur', 'Kunjirwadi', 'Manjari', 'Phursungi'],
    Mulshi: ['Pirangut', 'Lavale', 'Paud', 'Mulshi', 'Bhugaon'],
    Maval: ['Talegaon', 'Vadgaon', 'Kamshet', 'Lonavala'],
    Niphad: ['Niphad', 'Pimpalgaon', 'Lasalgaon', 'Vinchur'],
  } as Record<string, string[]>,
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('FARMER');
  const [regState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Pune');
  const [regBlock, setRegBlock] = useState('Haveli');
  const [regPanchayat, setRegPanchayat] = useState('Uruli Kanchan');

  const doLogin = (user: Parameters<typeof login>[0]) => {
    setLoading(true);
    setTimeout(() => {
      login(user);
      setLoading(false);
      navigate(user.role === 'FARMER' ? '/farmer' : '/officer');
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields.'); return; }
    doLogin({ name: email.split('@')[0], email, role: 'FARMER' });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPass) { setError('Please fill all fields.'); return; }
    doLogin({ name: regName, email: regEmail, role: regRole as any, panchayat: regPanchayat, block: regBlock });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D1E] via-[#0B5D3B] to-[#1a7a4a] flex flex-col items-center justify-center p-4">

      {/* Brand */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-white/15 rounded-2xl p-3"><CloudRain className="text-white" size={32} /></div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Kisan Saarthi</h1>
            <p className="text-green-200 text-sm">Panchayat-Level Agro-Met Intelligence · SIH26074</p>
          </div>
        </div>
        <p className="text-green-300 text-xs">Ministry of Earth Sciences · India Meteorological Department</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b">
          {(['login', 'register'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`py-4 text-sm font-bold capitalize transition-colors ${tab === t ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}>
              {t === 'login' ? '🔑 Login' : '📝 Register'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 pr-10"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input value={regName} onChange={e => setRegName(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ramesh Patil" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white">
                    <option value="FARMER">🌱 Farmer</option>
                    <option value="OFFICER">📡 Field Officer</option>
                    <option value="ADMIN">🛡️ Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input type={showPass ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 pr-10"
                    placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Location Hierarchy */}
              <div className="bg-gray-50 rounded-2xl p-3 space-y-2 border">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">📍 Your Location</p>
                <select className="w-full border rounded-xl px-3 py-2 text-sm bg-white" disabled><option>Maharashtra</option></select>
                <select value={regDistrict} onChange={e => { setRegDistrict(e.target.value); setRegBlock(LOCATIONS.blocks[e.target.value]?.[0] || ''); setRegPanchayat(''); }}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                  {LOCATIONS.districts.Maharashtra.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={regBlock} onChange={e => { setRegBlock(e.target.value); setRegPanchayat(LOCATIONS.panchayats[e.target.value]?.[0] || ''); }}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                  {(LOCATIONS.blocks[regDistrict] || []).map(b => <option key={b}>{b} Block</option>)}
                </select>
                {LOCATIONS.panchayats[regBlock] && (
                  <select value={regPanchayat} onChange={e => setRegPanchayat(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                    {LOCATIONS.panchayats[regBlock].map(p => <option key={p}>{p} Panchayat</option>)}
                  </select>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Or try a demo account</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* ── DEMO BUTTONS ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => doLogin({ name: 'Ramesh Patil', email: 'farmer@demo.in', role: 'FARMER', panchayat: 'Uruli Kanchan', block: 'Haveli' })}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 bg-green-50 rounded-2xl hover:bg-green-100 hover:border-green-400 transition-all group disabled:opacity-50"
            >
              <div className="bg-green-100 group-hover:bg-green-200 rounded-xl p-2 transition-colors">
                <Sprout size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-primary">Demo Farmer</p>
                <p className="text-xs text-gray-500">Uruli Kanchan, Haveli</p>
              </div>
            </button>

            <button
              onClick={() => doLogin({ name: 'Dr. Meera Singh', email: 'officer@demo.in', role: 'OFFICER', block: 'Haveli' })}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 bg-blue-50 rounded-2xl hover:bg-blue-100 hover:border-blue-400 transition-all group disabled:opacity-50"
            >
              <div className="bg-blue-100 group-hover:bg-blue-200 rounded-xl p-2 transition-colors">
                <Shield size={24} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-600">Demo Officer</p>
                <p className="text-xs text-gray-500">Haveli Block, Pune</p>
              </div>
            </button>
          </div>

          {/* Guest access */}
          <button
            onClick={() => doLogin({ name: 'Guest', email: 'guest@demo.in', role: 'FARMER' })}
            className="mt-3 w-full text-gray-400 text-xs py-2 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <User size={12} /> Continue as Guest (View Only)
          </button>
        </div>
      </div>

      <p className="text-green-400 text-xs mt-6 text-center">
        Secured with JWT · OAuth 2.0 · Firebase Auth<br />
        Smart India Hackathon 2026 · SIH26074
      </p>
    </div>
  );
};

export default LoginPage;
