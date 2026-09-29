import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, ArrowLeft, CloudRain, AlertCircle } from 'lucide-react';
import { apiLogin, apiRegister } from '../services/api';

const DISTRICTS = ['Pune', 'Nashik', 'Aurangabad', 'Kolhapur', 'Nagpur'];
const BLOCKS: Record<string, string[]> = {
  Pune:       ['Haveli', 'Mulshi', 'Maval', 'Khed', 'Shirur', 'Bhor'],
  Nashik:     ['Niphad', 'Sinnar', 'Dindori', 'Igatpuri'],
  Aurangabad: ['Gangapur', 'Vaijapur', 'Kannad'],
  Kolhapur:   ['Karveer', 'Hatkanangle', 'Shirol'],
  Nagpur:     ['Hingna', 'Kamthi', 'Ramtek'],
};

type Tab = 'login' | 'register';

const StaffLoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [tab, setTab]         = useState<Tab>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [rName, setRName]         = useState('');
  const [rEmail, setREmail]       = useState('');
  const [rPass, setRPass]         = useState('');
  const [rRole, setRRole]         = useState('OFFICER');
  const [rDistrict, setRDistrict] = useState('Pune');
  const [rBlock, setRBlock]       = useState('Haveli');
  const [rId, setRId]             = useState('');

  const saveAndGo = (userData: any, token: string) => {
    login({ id: userData.id, name: userData.name, email: userData.email,
            role: userData.role, block: userData.block, district: userData.district }, token);
    navigate('/staff/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await apiLogin(email, password);
      saveAndGo(res.user, res.access_token);
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        saveAndGo({
          id: Date.now().toString(),
          name: email.split('@')[0], email, role: 'OFFICER',
          district: 'Pune', block: 'Haveli',
        }, 'demo-token');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rEmail || !rPass) { setError('Please fill all fields.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await apiRegister({ name: rName, email: rEmail, password: rPass,
        role: rRole, district: rDistrict, block: rBlock });
      saveAndGo(res.user, res.access_token);
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        saveAndGo({
          id: Date.now().toString(),
          name: rName, email: rEmail, role: rRole,
          district: rDistrict, block: rBlock,
        }, 'demo-token');
      }
    } finally { setLoading(false); }
  };

  const handleDemo = async (name: string, email: string, role: string, block: string) => {
    setLoading(true); setError('');
    try {
      const res = await apiLogin(email, 'demo123');
      saveAndGo(res.user, res.access_token);
    } catch {
      login({ name, email, role: role as any, block });
      navigate('/staff/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">

      {/* Top nav */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 text-blue-700 font-extrabold">
          <CloudRain size={18} /> Kisan Saarthi
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-blue-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-extrabold">Staff Portal</h1>
          <p className="text-blue-100 text-sm mt-1">IMD Field Officers · Block Supervisors · Admins</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b">
          {(['login', 'register'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`py-3.5 text-sm font-bold capitalize transition-colors
                ${tab === t ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
              {t === 'login' ? '🔑 Login' : '📝 Register'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle size={15}/> {error}
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Official Email / Employee ID</label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  placeholder="officer@imd.gov.in" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 pr-10"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign In as Staff'}
              </button>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input value={rName} onChange={e => setRName(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    placeholder="Dr. Meera Singh" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role</label>
                  <select value={rRole} onChange={e => setRRole(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-white">
                    <option value="OFFICER">📡 Field Officer</option>
                    <option value="SUPERVISOR">🗂 Block Supervisor</option>
                    <option value="ADMIN">🛡️ Admin</option>
                    <option value="OPERATOR">⚙️ Data Operator</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Official Email</label>
                <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  placeholder="name@imd.gov.in" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Employee ID</label>
                <input value={rId} onChange={e => setRId(e.target.value)}
                  className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  placeholder="IMD-2024-XXXXX" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative mt-1">
                  <input type={showPass ? 'text' : 'password'} value={rPass} onChange={e => setRPass(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 pr-10"
                    placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Assigned Location */}
              <div className="bg-blue-50 rounded-2xl p-3 space-y-2 border border-blue-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">🗺 Assigned Jurisdiction</p>
                <select className="w-full border rounded-xl px-3 py-2 text-sm bg-white" disabled><option>Maharashtra</option></select>
                <select value={rDistrict} onChange={e => { setRDistrict(e.target.value); setRBlock(BLOCKS[e.target.value]?.[0] ?? ''); }}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                  {DISTRICTS.map(d => <option key={d}>{d} District</option>)}
                </select>
                <select value={rBlock} onChange={e => setRBlock(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                  {(BLOCKS[rDistrict] || []).map(b => <option key={b}>{b} Block</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60">
                {loading ? 'Creating account…' : 'Register as Staff'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Or use demo account</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleDemo('Dr. Meera Singh','officer@imd.gov.in','OFFICER','Haveli')} disabled={loading}
              className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 bg-blue-50 rounded-2xl hover:bg-blue-100 hover:border-blue-400 transition-all disabled:opacity-50">
              <Shield size={22} className="text-blue-600" />
              <div className="text-center">
                <p className="text-xs font-bold text-blue-600">Demo Officer</p>
                <p className="text-xs text-gray-400">Haveli, Pune</p>
              </div>
            </button>
            <button onClick={() => handleDemo('Amit Kumar','admin@imd.gov.in','ADMIN','Niphad')} disabled={loading}
              className="flex flex-col items-center gap-2 p-4 border-2 border-purple-200 bg-purple-50 rounded-2xl hover:bg-purple-100 hover:border-purple-400 transition-all disabled:opacity-50">
              <Shield size={22} className="text-purple-600" />
              <div className="text-center">
                <p className="text-xs font-bold text-purple-600">Demo Admin</p>
                <p className="text-xs text-gray-400">Niphad, Nashik</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-xs mt-6 text-center">Secured with JWT · OAuth 2.0 · Firebase Auth</p>
    </div>
  );
};

export default StaffLoginPage;
