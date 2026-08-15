
import React, { useState } from 'react';
import { UserProfile, ScoringResult, InjectionPoint } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Share2, ShieldCheck, ArrowLeft, Activity, Droplets, Layers, BoxSelect, Heart, Edit2, Save, Star, Plus, Target, Info, FileText, Download, CheckCircle, AlertTriangle, Crosshair, Zap, TrendingUp, Sparkles, MessageSquare, ExternalLink, Gauge, Syringe, ClipboardList, PenTool, Thermometer } from 'lucide-react';
import { Button } from './Button';
import { MOCK_ARCHITECTS } from '../services/mockData';

interface ProfileViewProps {
  user: UserProfile;
  scoring?: ScoringResult; 
  onBack: () => void;
  onShare?: () => void;
  onUploadMuse?: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return '#34d399'; 
    if (score >= 70) return '#fbbf24'; 
    return '#e11d48'; 
};

export const ProfileView: React.FC<ProfileViewProps> = ({ user, scoring, onBack, onShare, onUploadMuse }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'muse'>('overview');

  const diagnostics = scoring?.diagnostics || {
      projection: 0, migration: 0, textureIntegrity: 0, definition: 0, volumetricBalance: 0
  };

  const details = scoring?.details || {
      symmetryBalance: 0, cupidBowPrecision: 0, borderDefinition: 0, verticalRatio: 0, widthProportion: 0, smoothness: 0, vitality: 0
  };

  const radarData = [
    { subject: 'Sym', value: details.symmetryBalance },
    { subject: 'Cupid', value: details.cupidBowPrecision },
    { subject: 'Def', value: details.borderDefinition },
    { subject: 'Full', value: details.verticalRatio },
    { subject: 'Width', value: details.widthProportion },
    { subject: 'Smooth', value: details.smoothness },
    { subject: 'Vit', value: details.vitality },
  ];

  const blueprint = user.muse_blueprint;

  return (
    <div className="w-full min-h-screen bg-dark pb-32 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="relative w-full h-72 bg-gray-900">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
             {user.face_image_url && <img src={user.face_image_url} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />}
             <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
        </div>
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4 z-30 bg-black/30 backdrop-blur-md rounded-full p-2">
            <ArrowLeft size={20} />
        </Button>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20">
             <div className="w-40 h-20 rounded-full p-1 bg-gradient-to-r from-rose-500 to-purple-600 shadow-2xl">
                 <img src={user.lip_image_url} className="w-full h-full object-cover rounded-full" alt="" />
             </div>
        </div>
      </div>

      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">{user.nickname}</h1>
        <div className="mt-6 mb-8 flex flex-col items-center">
            <div className="text-6xl font-mono font-bold text-white leading-none">{user.score}</div>
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-3">Aesthetic Rank #{user.rank}</div>
        </div>

        <div className="flex justify-center gap-1 mb-8 bg-white/5 p-1 rounded-2xl inline-flex mx-auto">
            <button onClick={() => setActiveTab('overview')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-rose-600 text-white' : 'text-gray-500'}`}>Overview</button>
            <button onClick={() => setActiveTab('muse')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'muse' ? 'bg-amber-500 text-dark' : 'text-gray-500'}`}>Aesthetic Blueprint</button>
        </div>

        <div className="max-w-md mx-auto">
            {activeTab === 'overview' && (
                <div className="animate-fade-in space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-3">
                        <DiagCard label="Projection" val={diagnostics.projection} icon={TrendingUp} />
                        <DiagCard label="Migration" val={diagnostics.migration} icon={Activity} />
                        <DiagCard label="Texture" val={diagnostics.textureIntegrity} icon={Layers} />
                        <DiagCard label="Definition" val={diagnostics.definition} icon={Target} />
                    </div>
                    <div className="bg-card/40 border border-white/5 rounded-3xl p-6">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar dataKey="value" stroke="#e11d48" strokeWidth={3} fill="#e11d48" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'muse' && (
                <div className="animate-fade-in text-left space-y-8">
                    {!user.muse_lip_url ? (
                        <div className="bg-card/30 border-2 border-dashed border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                            <Star className="text-amber-500/50 mb-4" size={48} />
                            <h3 className="text-lg font-serif font-bold text-white mb-2">Similitude Mapping</h3>
                            <p className="text-xs text-gray-500 mb-8">Compare your profile to a goal personality for a professional-grade injection plan.</p>
                            <Button onClick={onUploadMuse} className="bg-amber-600 hover:bg-amber-500 text-dark font-black">
                                <Plus size={18} className="mr-2" /> Start Analysis
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* 1. CLINICAL HEADER */}
                            <div className="bg-black border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="p-4 bg-amber-500 text-dark flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <ClipboardList size={16} /> Injection Blueprint
                                    </h3>
                                    <span className="text-[10px] font-mono font-bold opacity-60">REF_{user.id.slice(-4)}</span>
                                </div>
                                <div className="p-6 grid grid-cols-2 gap-4">
                                     <ManifestStat label="Est. Total Volume" val={`${blueprint?.manifest.total_volume_estimate} ml`} icon={Droplets} />
                                     <ManifestStat label="Primary Grade" val="Medium G-Prime" icon={Thermometer} />
                                     <ManifestStat label="Est. Duration" val={`${blueprint?.manifest.estimated_duration_months} Months`} icon={Activity} />
                                     <ManifestStat label="Technique" val="Retrograde" icon={PenTool} />
                                </div>
                            </div>

                            {/* 2. VECTOR SCHEMATIC MAP */}
                            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden relative shadow-inner">
                                <div className="p-4 bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Crosshair size={14} className="text-amber-500" /> Vector Analysis Grid
                                </div>
                                <div className="relative aspect-[3/2] bg-black">
                                     <img src={user.lip_image_url} className="w-full h-full object-cover grayscale brightness-[0.3] contrast-[1.2]" alt="" />
                                     {/* Injection Overlays */}
                                     {blueprint?.injectionPoints.map((pt) => (
                                         <div key={pt.id} className="absolute group" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
                                             <div className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-amber-500/20 border border-amber-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                                 <Syringe size={10} className="text-amber-500" />
                                             </div>
                                             {/* Callout Line */}
                                             <div className="absolute top-0 left-0 w-20 h-px bg-amber-500/50 origin-left rotate-[-45deg] scale-x-0 group-hover:scale-x-100 transition-transform" />
                                             <div className="absolute -top-12 -left-4 hidden group-hover:block bg-black/90 p-2 rounded border border-amber-500/30 whitespace-nowrap z-50">
                                                 <div className="text-[8px] font-black text-amber-500 uppercase">{pt.mdCode}: {pt.label}</div>
                                                 <div className="text-[7px] text-white">{pt.volume_ml}ml @ {pt.angle_deg}°</div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                                <div className="p-6 bg-black/40">
                                     <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Architect's Manifest</h4>
                                     <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-amber-500/20 pl-4">
                                         {blueprint?.manifest.practitioner_notes}
                                     </p>
                                </div>
                            </div>

                            {/* 3. PRODUCT & NEEDLE SPECS */}
                            <div className="bg-card/40 border border-white/5 rounded-3xl p-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap size={14} className="text-sky-400" /> Clinical Requirements
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Suggested Needle Kit</div>
                                        <div className="flex gap-1">
                                            {blueprint?.manifest.needle_kit_req.map(n => (
                                                <span key={n} className="text-[8px] font-black bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full">{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Primary Material</div>
                                        <div className="text-[9px] font-black text-white uppercase tracking-tighter">{blueprint?.manifest.primary_filler_brand}</div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-white/5">
                                     <div className="flex items-center gap-3 text-rose-500 mb-4">
                                         <AlertTriangle size={16} />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Safety Protocols</span>
                                     </div>
                                     <ul className="space-y-2">
                                         {blueprint?.manifest.safety_warnings.map((w, i) => (
                                             <li key={i} className="text-[10px] text-gray-500 flex gap-2">
                                                 <span className="text-rose-500 font-bold">•</span> {w}
                                             </li>
                                         ))}
                                     </ul>
                                </div>
                            </div>

                            <Button className="w-full h-16 bg-white text-dark text-xs font-black uppercase tracking-widest shadow-2xl shadow-white/10 rounded-3xl flex items-center justify-center gap-3">
                                <Download size={18} /> Export Clinical Manifest
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const DiagCard = ({ label, val, icon: Icon }: any) => (
    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl">
        <div className="flex justify-between items-start mb-2">
            <Icon size={14} className="text-gray-500" />
            <span className="text-[9px] font-mono text-gray-600">{val.toFixed(0)}%</span>
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
);

const ManifestStat = ({ label, val, icon: Icon }: any) => (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Icon size={16} />
        </div>
        <div>
            <div className="text-[8px] font-bold text-gray-500 uppercase leading-none mb-1">{label}</div>
            <div className="text-[10px] font-black text-white uppercase leading-none">{val}</div>
        </div>
    </div>
);
