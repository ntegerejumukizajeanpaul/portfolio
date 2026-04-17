import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Shield, Calendar, Eye, ExternalLink } from 'lucide-react';
import api from '../api';

export default function Verify() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/portfolios/verify/${id}`)
      .then(r => setResult(r.data))
      .catch(err => setResult({ verified: false, error: err.response?.data?.error || 'Verification failed' }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400">Verifying portfolio...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center">
        {result?.verified ? (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/20">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Portfolio Verified</h1>
            <p className="text-slate-400 mb-8">This portfolio is authentic and verified.</p>

            <div className="glass-light rounded-2xl p-6 text-left space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-500">Owner</p>
                  <p className="text-white font-medium">{result.portfolio.owner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-white font-medium">{new Date(result.portfolio.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-500">Verification Count</p>
                  <p className="text-white font-medium">{result.portfolio.verification_count} times</p>
                </div>
              </div>
            </div>

            <Link to={`/portfolio/${id}`} className="gradient-brand px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2 hover:opacity-90 transition">
              <ExternalLink className="w-4 h-4" /> View Full Portfolio
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/20">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-slate-400 mb-6">{result?.error || 'This portfolio could not be verified.'}</p>
            <Link to="/" className="gradient-brand px-6 py-3 rounded-xl text-white font-semibold inline-block hover:opacity-90 transition">Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
