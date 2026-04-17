import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, ExternalLink } from 'lucide-react';
import api from '../api';

export default function Dashboard({ user }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/portfolios/my').then(r => setPortfolios(r.data.portfolios)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deletePortfolio = async (id) => {
    if (!confirm('Delete this portfolio?')) return;
    try {
      await api.delete(`/portfolios/${id}`);
      setPortfolios(p => p.filter(x => x.id !== id));
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome, {user.full_name}</h1>
          <p className="text-slate-400 mt-1">Manage your portfolios</p>
        </div>
        <Link to="/build" className="gradient-brand px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:opacity-90 transition">
          <Plus className="w-5 h-5" /> New Portfolio
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"></div></div>
      ) : portfolios.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-6"><Plus className="w-10 h-10 text-white" /></div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">No portfolios yet</h2>
          <p className="text-slate-400 mb-6">Create your first professional portfolio to start sharing with employers.</p>
          <Link to="/build" className="gradient-brand px-6 py-3 rounded-xl font-semibold text-white inline-flex items-center gap-2 hover:opacity-90 transition">
            <Plus className="w-5 h-5" /> Create Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map(p => (
            <div key={p.id} className="glass rounded-2xl p-6 hover:bg-white/10 transition group">
              <h3 className="font-display font-bold text-lg text-white mb-1">{p.title || 'Untitled Portfolio'}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{p.tagline || 'No tagline'}</p>
              <p className="text-xs text-slate-500 mb-4">Created {new Date(p.created_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/portfolio/${p.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition">
                  <Eye className="w-4 h-4" /> View
                </button>
                <button onClick={() => navigate(`/build/${p.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => deletePortfolio(p.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
