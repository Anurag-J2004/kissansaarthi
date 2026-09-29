import { Link } from 'react-router-dom';
import { Sprout, Shield, CloudRain, ArrowRight } from 'lucide-react';

const PortalSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D1E] via-[#0B5D3B] to-[#1a7a4a] flex flex-col items-center justify-center p-6">

      {/* Brand */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-white/15 rounded-2xl p-3">
            <CloudRain className="text-white" size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Kisan Saarthi</h1>
            <p className="text-green-200 text-sm">Panchayat-Level Agro-Met Intelligence</p>
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 inline-flex items-center gap-2 text-xs text-green-200">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          SIH26074 · Ministry of Earth Sciences · IMD
        </div>
      </div>

      {/* Portal Cards */}
      <p className="text-green-200 text-sm font-medium mb-6 uppercase tracking-widest">Select your portal</p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">

        {/* Farmer Portal */}
        <Link to="/farmer/login"
          className="group bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-4
                     hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-green-400">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Sprout size={40} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-dark-text mb-1">Farmer Portal</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              View panchayat-level weather forecasts, crop advisories, and soil moisture for your field
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mt-auto group-hover:gap-3 transition-all">
            Enter Farmer Portal <ArrowRight size={16} />
          </div>
        </Link>

        {/* Staff Portal */}
        <Link to="/staff/login"
          className="group bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-4
                     hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-blue-400">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Shield size={40} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-dark-text mb-1">Staff Portal</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Run ML spatial downscaling, view block-level risk maps, and manage agro-met advisories
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mt-auto group-hover:gap-3 transition-all">
            Enter Staff Portal <ArrowRight size={16} />
          </div>
        </Link>
      </div>

      <p className="text-green-500 text-xs mt-10 text-center">
        Agriculture, FoodTech & Rural Development · Smart India Hackathon 2026
      </p>
    </div>
  );
};

export default PortalSelector;
