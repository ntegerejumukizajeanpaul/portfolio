import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download, Share2, Mail, Phone, MapPin, Globe, Github, Linkedin,
  ExternalLink, QrCode, CheckCircle, Briefcase, GraduationCap,
  Wrench, Copy, Check, Facebook, Twitter, MessageCircle, ArrowLeft,
  Calendar, Award, Star, Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../api';

export default function PortfolioView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const portfolioRef = useRef(null);

  useEffect(() => {
    api.get(`/portfolios/${id}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const downloadPDF = async () => {
    if (!portfolioRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(portfolioRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#0f172a',
        logging: false, windowWidth: 1200
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const totalH = imgH * ratio;
      let position = 0;
      let page = 0;

      while (position < totalH) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfW, totalH);
        position += pdfH;
        page++;
      }
      pdf.save(`${data.portfolio.owner_name || data.portfolio.title || 'portfolio'}_CV.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  const shareUrl = window.location.href;
  const shareText = data ? `Check out ${data.portfolio.owner_name || data.portfolio.title}'s professional portfolio!` : '';

  const shareLinks = [
    { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, color: 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' },
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' },
    { name: 'Twitter / X', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, color: 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30' },
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, color: 'bg-green-600/20 text-green-400 hover:bg-green-600/30' },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400">Loading portfolio...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass rounded-3xl p-12 max-w-md">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
        <p className="text-slate-400 mb-6">This portfolio may have been removed or the link is incorrect.</p>
        <Link to="/" className="gradient-brand px-6 py-3 rounded-xl text-white font-semibold inline-block hover:opacity-90 transition">Go Home</Link>
      </div>
    </div>
  );

  const { portfolio, skills, education, experience, verification } = data;
  const skillsByCategory = skills.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc; }, {});
  const initials = (portfolio.owner_name || portfolio.title || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen print:bg-white">
      {/* Floating Action Bar */}
      <div className="sticky top-16 z-40 glass print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <span className="text-slate-600">|</span>
            <h2 className="font-display font-bold text-white truncate max-w-[200px]">{portfolio.owner_name || portfolio.title}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 transition">
              <QrCode className="w-4 h-4" /> <span className="hidden sm:inline">Verify</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-500/10 text-slate-300 text-sm hover:bg-slate-500/20 transition">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={() => setShowShare(!showShare)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
            </button>
            <button onClick={downloadPDF} disabled={downloading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
              <Download className="w-4 h-4" /> {downloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Share Panel */}
        {showShare && (
          <div className="max-w-6xl mx-auto px-4 pb-4 animate-fadeIn">
            <div className="glass-light rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Share this portfolio</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {shareLinks.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${s.color}`}>
                    <s.icon className="w-4 h-4" /> {s.name}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input readOnly value={shareUrl} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none" />
                <button onClick={copyLink} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition ${copied ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}>
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Panel */}
        {showQR && verification?.qr_code && (
          <div className="max-w-6xl mx-auto px-4 pb-4 animate-fadeIn">
            <div className="glass-light rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-2xl">
                <img src={verification.qr_code} alt="QR Code" className="w-44 h-44" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white font-medium flex items-center gap-1.5 justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Verified Portfolio
                </p>
                <p className="text-xs text-slate-500">Scanned {verification.verification_count || 0} times • Scan QR to verify authenticity</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ PORTFOLIO CONTENT ═══════════════ */}
      <div ref={portfolioRef} className="max-w-6xl mx-auto px-4 py-10">

        {/* ── HERO HEADER ── */}
        <section className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative glass rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-28 h-28 gradient-brand rounded-3xl flex items-center justify-center text-white font-display text-4xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-white/10">
                  {initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">
                  {portfolio.owner_name || portfolio.title}
                </h1>
                {portfolio.tagline && (
                  <p className="text-xl text-blue-400 font-semibold mb-4">{portfolio.tagline}</p>
                )}
                {portfolio.summary && (
                  <p className="text-slate-300 leading-relaxed max-w-2xl mb-6 text-base">{portfolio.summary}</p>
                )}

                {/* Contact chips */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {portfolio.email && (
                    <a href={`mailto:${portfolio.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition">
                      <Mail className="w-4 h-4 text-blue-400" />{portfolio.email}
                    </a>
                  )}
                  {portfolio.phone && (
                    <a href={`tel:${portfolio.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition">
                      <Phone className="w-4 h-4 text-blue-400" />{portfolio.phone}
                    </a>
                  )}
                  {portfolio.location && (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                      <MapPin className="w-4 h-4 text-blue-400" />{portfolio.location}
                    </span>
                  )}
                  {portfolio.website && (
                    <a href={portfolio.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition">
                      <Globe className="w-4 h-4 text-blue-400" />Website
                    </a>
                  )}
                  {portfolio.linkedin && (
                    <a href={portfolio.linkedin.startsWith('http') ? portfolio.linkedin : `https://${portfolio.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition">
                      <Linkedin className="w-4 h-4 text-blue-400" />LinkedIn
                    </a>
                  )}
                  {portfolio.github && (
                    <a href={portfolio.github.startsWith('http') ? portfolio.github : `https://${portfolio.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition">
                      <Github className="w-4 h-4 text-blue-400" />GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold gradient-text font-display">{skills.length}</div>
            <div className="text-sm text-slate-400 mt-1">Skills</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold gradient-text font-display">{experience.length}</div>
            <div className="text-sm text-slate-400 mt-1">Experience</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold gradient-text font-display">{education.length}</div>
            <div className="text-sm text-slate-400 mt-1">Education</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold gradient-text font-display">
              <CheckCircle className="w-7 h-7 text-green-400 mx-auto" />
            </div>
            <div className="text-sm text-slate-400 mt-1">QR Verified</div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN: Skills ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-white" /></div>
                Skills & Expertise
              </h2>
              {Object.entries(skillsByCategory).map(([cat, items]) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <h3 className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">{cat}</h3>
                  {items.map((s, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-200 font-medium">{s.name}</span>
                        <span className="text-blue-400 font-semibold">{s.level}%</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full gradient-brand rounded-full transition-all duration-700 ease-out" style={{ width: `${s.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* QR Code Card */}
            {verification?.qr_code && (
              <div className="glass rounded-2xl p-6 text-center">
                <h3 className="font-display text-sm font-bold text-white mb-3 flex items-center gap-2 justify-center">
                  <Award className="w-4 h-4 text-emerald-400" /> Verified Portfolio
                </h3>
                <div className="bg-white p-2 rounded-xl inline-block mb-3">
                  <img src={verification.qr_code} alt="QR Code" className="w-28 h-28" />
                </div>
                <p className="text-xs text-slate-500">Scan to verify authenticity</p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Experience & Education ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            {experience.length > 0 && (
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div>
                  Professional Experience
                </h2>
                <div className="space-y-8">
                  {experience.map((e, i) => (
                    <div key={i} className="relative pl-8 border-l-2 border-blue-500/30">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full gradient-brand ring-4 ring-slate-800/50"></div>
                      <div className="glass-light rounded-xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h3 className="font-display font-bold text-lg text-white">{e.position}</h3>
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 sm:mt-0">
                            <Calendar className="w-3.5 h-3.5" />
                            {e.start_date} — {e.is_current ? <span className="text-green-400 font-medium">Present</span> : e.end_date}
                          </span>
                        </div>
                        <p className="text-blue-400 text-sm font-semibold mb-2">{e.company}</p>
                        {e.description && <p className="text-sm text-slate-400 leading-relaxed">{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div>
                  Education
                </h2>
                <div className="space-y-6">
                  {education.map((e, i) => (
                    <div key={i} className="relative pl-8 border-l-2 border-purple-500/30">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ring-4 ring-slate-800/50"></div>
                      <div className="glass-light rounded-xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h3 className="font-display font-bold text-lg text-white">{e.institution}</h3>
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 sm:mt-0">
                            <Calendar className="w-3.5 h-3.5" />
                            {e.start_date} — {e.end_date || 'Present'}
                          </span>
                        </div>
                        <p className="text-purple-400 text-sm font-semibold">{e.degree}{e.field_of_study ? ` in ${e.field_of_study}` : ''}</p>
                        {e.description && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="mt-12 text-center">
          <div className="glass rounded-2xl p-6 inline-flex flex-col sm:flex-row items-center gap-4">
            <p className="text-slate-400 text-sm">Interested in working together?</p>
            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className="gradient-brand px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition">
                Get in Touch
              </a>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-4">Built with ProFolio • Portfolio verified via QR code</p>
        </div>
      </div>

      {/* ── BOTTOM FIXED ACTIONS (Mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass sm:hidden print:hidden z-50">
        <div className="flex gap-3">
          <button onClick={() => setShowShare(!showShare)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/10 text-purple-400 font-semibold text-sm">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={downloadPDF} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold text-sm disabled:opacity-50">
            <Download className="w-4 h-4" /> {downloading ? 'Wait...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
