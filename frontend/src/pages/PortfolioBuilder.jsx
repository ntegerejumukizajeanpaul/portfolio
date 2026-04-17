import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, GraduationCap, Briefcase, Wrench, User, Save, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import api from '../api';

const emptySkill = { name: '', level: 70, category: 'Technical' };
const emptyEdu = { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' };
const emptyExp = { company: '', position: '', start_date: '', end_date: '', is_current: false, description: '' };

export default function PortfolioBuilder({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', tagline: '', summary: '', phone: '', email: user?.email || '', location: '',
    linkedin: '', github: '', website: '',
    skills: [{ ...emptySkill }],
    education: [{ ...emptyEdu }],
    experience: [{ ...emptyExp }]
  });

  useEffect(() => {
    if (id) {
      api.get(`/portfolios/${id}`).then(r => {
        const d = r.data;
        setForm({
          title: d.portfolio.title || '', tagline: d.portfolio.tagline || '', summary: d.portfolio.summary || '',
          phone: d.portfolio.phone || '', email: d.portfolio.email || '', location: d.portfolio.location || '',
          linkedin: d.portfolio.linkedin || '', github: d.portfolio.github || '', website: d.portfolio.website || '',
          skills: d.skills.length ? d.skills : [{ ...emptySkill }],
          education: d.education.length ? d.education : [{ ...emptyEdu }],
          experience: d.experience.length ? d.experience : [{ ...emptyExp }]
        });
      }).catch(() => navigate('/dashboard'));
    }
  }, [id]);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const updateArr = (arr, idx, key, val) => {
    const copy = [...form[arr]];
    copy[idx] = { ...copy[idx], [key]: val };
    update(arr, copy);
  };
  const addItem = (arr, template) => update(arr, [...form[arr], { ...template }]);
  const removeItem = (arr, idx) => update(arr, form[arr].filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('Please enter a portfolio title');
    setSaving(true);
    try {
      if (id) {
        await api.put(`/portfolios/${id}`, form);
        navigate(`/portfolio/${id}`);
      } else {
        const { data } = await api.post('/portfolios/create', form);
        navigate(`/portfolio/${data.portfolio.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: 'About You', icon: User, desc: 'Personal info & contact' },
    { label: 'Skills', icon: Wrench, desc: 'Your expertise' },
    { label: 'Education', icon: GraduationCap, desc: 'Academic background' },
    { label: 'Experience', icon: Briefcase, desc: 'Work history' },
  ];

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition";

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 0;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{id ? 'Edit Portfolio' : 'Build Your Portfolio'}</h1>
          <p className="text-slate-400 mt-1">Step {step + 1} of {steps.length} — {steps[step].desc}</p>
        </div>
        {id && (
          <button onClick={() => navigate(`/portfolio/${id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition">
            <Eye className="w-4 h-4" /> Preview
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-10">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
              i === step ? 'gradient-brand text-white shadow-lg shadow-blue-500/20'
              : i < step ? 'glass text-blue-400 border-blue-500/30'
              : 'glass text-slate-500 hover:text-slate-300'
            }`}>
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
            {i < step && <span className="text-xs">✓</span>}
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl p-8">
        {/* Step 0: About */}
        {step === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="font-display text-xl font-bold text-white mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm text-slate-300 mb-2">Portfolio Title *</label><input className={inputCls} value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Full Stack Developer" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">Tagline</label><input className={inputCls} value={form.tagline} onChange={e => update('tagline', e.target.value)} placeholder="Passionate about building great software" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">Email</label><input type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">Phone</label><input className={inputCls} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+250 788 000 000" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">Location</label><input className={inputCls} value={form.location} onChange={e => update('location', e.target.value)} placeholder="Kigali, Rwanda" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">Website</label><input className={inputCls} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yoursite.com" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">LinkedIn</label><input className={inputCls} value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/you" /></div>
              <div><label className="block text-sm text-slate-300 mb-2">GitHub</label><input className={inputCls} value={form.github} onChange={e => update('github', e.target.value)} placeholder="github.com/you" /></div>
            </div>
            <div><label className="block text-sm text-slate-300 mb-2">Professional Summary</label><textarea rows={4} className={inputCls} value={form.summary} onChange={e => update('summary', e.target.value)} placeholder="A brief introduction about yourself, your passion, and what you bring to the table..." /></div>
          </div>
        )}

        {/* Step 1: Skills */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Skills & Expertise</h2>
              <button onClick={() => addItem('skills', emptySkill)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition"><Plus className="w-4 h-4" /> Add Skill</button>
            </div>
            {form.skills.map((s, i) => (
              <div key={i} className="glass-light rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Skill {i + 1}</span>
                  {form.skills.length > 1 && <button onClick={() => removeItem('skills', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input className={inputCls} value={s.name} onChange={e => updateArr('skills', i, 'name', e.target.value)} placeholder="e.g. React.js" />
                  <select className={inputCls} value={s.category} onChange={e => updateArr('skills', i, 'category', e.target.value)}>
                    <option value="Technical">Technical</option><option value="Soft Skills">Soft Skills</option><option value="Tools">Tools</option><option value="Languages">Languages</option>
                  </select>
                  <div className="flex items-center gap-3">
                    <input type="range" min="10" max="100" value={s.level} onChange={e => updateArr('skills', i, 'level', parseInt(e.target.value))} className="flex-1 accent-blue-500" />
                    <span className="text-sm text-blue-400 w-10 text-right font-semibold">{s.level}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Education */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Education</h2>
              <button onClick={() => addItem('education', emptyEdu)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition"><Plus className="w-4 h-4" /> Add Education</button>
            </div>
            {form.education.map((e, i) => (
              <div key={i} className="glass-light rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Education {i + 1}</span>
                  {form.education.length > 1 && <button onClick={() => removeItem('education', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className={inputCls} value={e.institution} onChange={ev => updateArr('education', i, 'institution', ev.target.value)} placeholder="University Name" />
                  <input className={inputCls} value={e.degree} onChange={ev => updateArr('education', i, 'degree', ev.target.value)} placeholder="Bachelor's Degree" />
                  <input className={inputCls} value={e.field_of_study} onChange={ev => updateArr('education', i, 'field_of_study', ev.target.value)} placeholder="Computer Science" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="month" className={inputCls} value={e.start_date} onChange={ev => updateArr('education', i, 'start_date', ev.target.value)} />
                    <input type="month" className={inputCls} value={e.end_date} onChange={ev => updateArr('education', i, 'end_date', ev.target.value)} />
                  </div>
                </div>
                <textarea rows={2} className={inputCls} value={e.description} onChange={ev => updateArr('education', i, 'description', ev.target.value)} placeholder="Relevant coursework, achievements, etc." />
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Professional Experience</h2>
              <button onClick={() => addItem('experience', emptyExp)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition"><Plus className="w-4 h-4" /> Add Experience</button>
            </div>
            {form.experience.map((e, i) => (
              <div key={i} className="glass-light rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Position {i + 1}</span>
                  {form.experience.length > 1 && <button onClick={() => removeItem('experience', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className={inputCls} value={e.company} onChange={ev => updateArr('experience', i, 'company', ev.target.value)} placeholder="Company Name" />
                  <input className={inputCls} value={e.position} onChange={ev => updateArr('experience', i, 'position', ev.target.value)} placeholder="Job Title" />
                  <input type="month" className={inputCls} value={e.start_date} onChange={ev => updateArr('experience', i, 'start_date', ev.target.value)} />
                  <div className="flex items-center gap-3">
                    <input type="month" className={inputCls} value={e.end_date} onChange={ev => updateArr('experience', i, 'end_date', ev.target.value)} disabled={e.is_current} />
                    <label className="flex items-center gap-2 text-sm text-slate-300 whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={e.is_current} onChange={ev => updateArr('experience', i, 'is_current', ev.target.checked)} className="accent-blue-500" /> Current
                    </label>
                  </div>
                </div>
                <textarea rows={3} className={inputCls} value={e.description} onChange={ev => updateArr('experience', i, 'description', ev.target.value)} placeholder="Describe your responsibilities, achievements, and key contributions..." />
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => Math.min(3, s + 1))}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-brand text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {saving ? (
                <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> Creating...</>
              ) : (
                <><Save className="w-5 h-5" /> Create Portfolio</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
