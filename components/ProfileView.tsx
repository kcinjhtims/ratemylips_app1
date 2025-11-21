
import React, { useState } from 'react';
import { UserProfile, ScoringResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Share2, MapPin, Shield, ArrowLeft, Info, Activity, Palette, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ProfileViewProps {
  user: UserProfile;
  scoring?: ScoringResult; 
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, scoring, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'insights'>('overview');

  // Default values if scoring is missing (viewing other users in basic mode)
  const scores = scoring?.dimensionScores || {
    symmetry: 85,
    proportionHorizontal: 80,
    proportionVertical: 90,
    shape: 75,
    texture: 88,
    color: 92,
    naturalness: 95,
    pose: 100
  };

  const details = scoring?.details || {
    cupidBowPrecision: 70,
    cornerDefinition: 80,
    verticalRatio: 85,
    smoothness: 80,
    hydration: 85,
    borderDefinition: 75,
    vitality: 90,
    uniformity: 95,
    symmetryBalance: 85,
    widthProportion: 80
  };

  const radarData = [
    { subject: 'Sym', A: scores.symmetry, fullMark: 100 },
    { subject: 'Prop', A: (scores.proportionHorizontal + scores.proportionVertical) / 2, fullMark: 100 },
    { subject: 'Shape', A: scores.shape, fullMark: 100 },
    { subject: 'Text', A: scores.texture, fullMark: 100 },
    { subject: 'Color', A: scores.color, fullMark: 100 },
    { subject: 'Nat', A: scores.naturalness, fullMark: 100 },
  ];

  // Color scales for charts
  const getScoreColor = (score: number) => {
      if (score >= 90) return '#34d399'; // Emerald 400
      if (score >= 70) return '#e11d48'; // Rose 600
      if (score >= 50) return '#f59e0b'; // Amber 500
      return '#64748b'; // Slate 500
  };

  const MetricBar = ({ label, value }: { label: string, value: number }) => (
    <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-gray-400">
            <span>{label}</span>
            <span style={{ color: getScoreColor(value) }}>{value.toFixed(0)}/100</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{ 
                    width: `${value}%`,
                    backgroundColor: getScoreColor(value)
                }}
            />
        </div>
    </div>
  );

  const InsightCard = ({ title, score, goodText, badText, icon: Icon }: any) => (
    <div className="bg-card/50 border border-white/5 p-4 rounded-xl mb-3">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${score >= 70 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Icon size={18} />
            </div>
            <h4 className="font-bold text-gray-200">{title}</h4>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
            {score >= 70 ? goodText : badText}
        </p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-dark pb-24 animate-fade-in overflow-y-auto no-scrollbar">
      {/* Header Image */}
      <div className="relative w-full h-80 bg-gray-900">
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4 z-30 bg-black/30 backdrop-blur-md text-white rounded-full p-2 hover:bg-black/50">
            <ArrowLeft size={24} />
        </Button>
        
        {user.allow_full_face_public && user.face_image_url ? (
             <img 
                src={user.face_image_url} 
                alt="Full Face" 
                className="w-full h-full object-cover opacity-40 blur-[1px]" 
             />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-dark">
                 <Shield className="text-gray-600 mb-2" size={48} />
                 <p className="text-gray-500 absolute bottom-4 font-serif italic">Full face is private</p>
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/95 via-30% to-transparent" />
        
        {/* Floating Lip Crop */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20">
             <div className="w-48 h-24 rounded-full p-[2px] bg-gradient-to-b from-rose-400 to-purple-600 shadow-2xl shadow-rose-500/30">
                 <div className="w-full h-full rounded-full overflow-hidden relative bg-black">
                    {user.lip_image_url ? (
                        <img 
                            src={user.lip_image_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full text-xs text-gray-600">No Image</div>
                    )}
                 </div>
            </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="mt-16 text-center px-6">
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">{user.nickname}</h1>
        <div className="flex items-center justify-center text-rose-400 mt-2 text-sm font-medium uppercase tracking-widest">
            <MapPin size={12} className="mr-1" />
            {user.location_city}, {user.location_country}
        </div>

        {/* Score Hero */}
        <div className="mt-8 mb-8 relative">
            <div className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-200 to-rose-400 animate-pulse-slow">
                {user.score}
            </div>
            <div className="text-xs text-gray-500 mt-2 font-mono">
                RANK #{user.rank} • TOP {(user.rank / 50 * 100).toFixed(1)}%
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8 bg-white/5 p-1 rounded-xl inline-flex mx-auto">
            {(['overview', 'metrics', 'insights'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab 
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="max-w-md mx-auto min-h-[300px]">
            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    <div className="h-72 w-full relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid gridType="polygon" stroke="#334155" strokeWidth={0.5} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Lips"
                                    dataKey="A"
                                    stroke="#e11d48"
                                    strokeWidth={3}
                                    fill="#e11d48"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-card p-4 rounded-2xl border border-white/5">
                             <div className="text-gray-500 text-xs uppercase mb-1">Dominant Trait</div>
                             <div className="text-xl font-bold text-rose-400">Naturalness</div>
                         </div>
                         <div className="bg-card p-4 rounded-2xl border border-white/5">
                             <div className="text-gray-500 text-xs uppercase mb-1">Weakest Link</div>
                             <div className="text-xl font-bold text-gray-300">Texture</div>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'metrics' && (
                <div className="text-left animate-fade-in space-y-8 px-2">
                    <div>
                        <h3 className="text-lg font-serif text-white mb-4 flex items-center">
                            <Sparkles size={18} className="mr-2 text-yellow-400" /> Geometry & Shape
                        </h3>
                        <MetricBar label="Cupid's Bow Precision" value={details.cupidBowPrecision} />
                        <MetricBar label="Symmetry Balance" value={details.symmetryBalance} />
                        <MetricBar label="Vertical Ratio (Fullness)" value={details.verticalRatio} />
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-white mb-4 flex items-center">
                            <Activity size={18} className="mr-2 text-blue-400" /> Health & Texture
                        </h3>
                        <MetricBar label="Hydration Level" value={details.hydration} />
                        <MetricBar label="Surface Smoothness" value={details.smoothness} />
                        <MetricBar label="Border Definition" value={details.borderDefinition} />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-serif text-white mb-4 flex items-center">
                            <Palette size={18} className="mr-2 text-pink-400" /> Color Analysis
                        </h3>
                        <MetricBar label="Vitality (Redness)" value={details.vitality} />
                        <MetricBar label="Tone Uniformity" value={details.uniformity} />
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="text-left animate-fade-in">
                    <h3 className="text-lg font-serif text-white mb-6">AI Verdict</h3>
                    
                    <InsightCard 
                        title="Hydration"
                        icon={Activity}
                        score={details.hydration}
                        goodText="Excellent hydration detected. Your lips reflect light well, indicating good health and maintenance."
                        badText="Detected signs of dryness or surface roughness. Consider using a hydrating balm to improve your texture score."
                    />

                    <InsightCard 
                        title="Symmetry"
                        icon={Sparkles}
                        score={details.symmetryBalance}
                        goodText="Your symmetry is nearly perfect. This is a rare trait that significantly boosts your overall aesthetic score."
                        badText="Minor asymmetry detected between left and right sides. This is natural for 95% of humans, but affects the geometry score slightly."
                    />

                    <InsightCard 
                        title="Color Vitality"
                        icon={Palette}
                        score={details.vitality}
                        goodText="Strong natural pigmentation gives your lips a healthy, vibrant look without needing makeup."
                        badText="Color analysis suggests slightly pale tones. This could be lighting-related, or a sign to boost circulation."
                    />
                </div>
            )}
        </div>

        <div className="mt-12 mb-6">
            <Button variant="primary" className="w-full">
                <Share2 size={18} className="mr-2" /> Share Analysis
            </Button>
        </div>
      </div>
    </div>
  );
};
