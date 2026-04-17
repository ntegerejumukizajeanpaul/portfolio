import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">ProFolio</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/build" className="gradient-brand px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition">
                  + New Portfolio
                </Link>
                <button onClick={() => { onLogout(); navigate('/'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="gradient-brand px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
