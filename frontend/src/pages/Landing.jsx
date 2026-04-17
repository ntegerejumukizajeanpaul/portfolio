import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Share2, Download, QrCode, Zap } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Beautiful Design', desc: 'Professional portfolio templates that make you stand out to recruiters.' },
  { icon: Shield, title: 'QR Verification', desc: 'Every portfolio includes a QR code for instant credential verification.' },
  { icon: Share2, title: 'Share Everywhere', desc: 'Share on LinkedIn, Facebook, Instagram and more with one click.' },
  { icon: Download, title: 'Download PDF', desc: 'Download your portfolio as a high-quality PDF for job applications.' },
  { icon: QrCode, title: 'Verified Badge', desc: 'Employers can scan your QR code to verify your portfolio is authentic.' },
  { icon: Zap, title: 'Quick Setup', desc: 'Build your complete professional portfolio in under 10 minutes.' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-blue-300 mb-8">
            <Sparkles className="w-4 h-4" /> Build your career story
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">Create Your</span><br />
            <span className="gradient-text">Professional Portfolio</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Build a stunning portfolio that showcases your skills, education, and experience. Share it with employers and verify your credentials with QR codes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="gradient-brand px-8 py-4 rounded-2xl text-lg font-bold text-white hover:opacity-90 transition shadow-lg shadow-blue-500/25">
              Start Building — It's Free
            </Link>
            <Link to="/login" className="glass px-8 py-4 rounded-2xl text-lg font-semibold text-white hover:bg-white/10 transition">
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-white mb-4">Everything You Need</h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Create, share, and verify your professional portfolio with powerful tools.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:bg-white/10 transition group">
              <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ProFolio. Build your future.
      </footer>
    </div>
  );
}
