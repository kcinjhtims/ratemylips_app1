
import React, { useState } from 'react';
import { UserProfile, ScoringResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { Share2, MapPin, Shield, ArrowLeft, Activity, Palette, Sparkles, Droplets, Layers, BoxSelect, Grid, Trophy, Fingerprint, Ruler, Heart, Edit2, Save } from 'lucide-react';
import { Button } from './Button';

interface ProfileViewProps {
  user: UserProfile;
  scoring?: ScoringResult; 
  onBack: () => void;
  onShare?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, scoring, onBack, onShare }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'insights'>('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.nickname);
  const [displayNickname, setDisplayNickname] = useState(user.nickname);

  // Default values fallback
  const scores = scoring?.dimensionScores || {
    symmetry: 0, proportionHorizontal: 0, proportionVertical: 0, shape: 0, texture: 0, color: 0, naturalness: 0, pose: 0
  };

  const details = scoring?.details || {
    cupidBowPrecision: 0, cornerDefinition: 0, verticalRatio: 0, smoothness: 0, hydration: 0, borderDefinition: 0, vitality: 0, uniformity: 0, symmetryBalance: 0, widthProportion: 0,
    philtrumDepth: 0, vermilionContrast: 0, lateralVolume: 0, lowerLipPout: 0, verticalLineScore: 0, naturalGloss: 0, skinHealth: 0, pigmentationDepth: 0, gradientSmoothness: 0, upperLowerBalance: 0, cornerUplift: 0
  };

  // --- Overview Data ---
  // Radar Data mapped EXACTLY to the metric labels used in "Weakest Link"
  // The chart labels must match what the user sees in the text
  const radarData = [
    { subject: 'Sym', fullLabel: 'Symmetry', value: details.symmetryBalance, fullMark: 100 },
    { subject: 'Cupid', fullLabel: "Cupid's Bow", value: details.cupidBowPrecision, fullMark: 100 },
    { subject: 'Def', fullLabel: 'Definition', value: details.borderDefinition, fullMark: 100 },
    { subject: 'Full', fullLabel: 'Fullness', value: details.verticalRatio, fullMark: 100 },
    { subject: 'Width', fullLabel: 'Prop. Width', value: details.widthProportion, fullMark: 100 },
    { subject: 'Smooth', fullLabel: 'Smoothness', value: details.smoothness, fullMark: 100 },
    { subject: 'Hydro', fullLabel: 'Hydration', value: details.hydration, fullMark: 100 },
    { subject: 'Vit', fullLabel: 'Vitality', value: details.vitality, fullMark: 100 }, // Fixed: was Color
    { subject: 'Even', fullLabel: 'Uniformity', value: details.uniformity, fullMark: 100 },
    { subject: 'Glow', fullLabel: 'Gloss', value: details.naturalGloss, fullMark: 100 },
    { subject: 'Nat', fullLabel: 'Naturalness', value: scores.naturalness, fullMark: 100 },
    { subject: 'Smile', fullLabel: 'Smile Potential', value: details.cornerUplift, fullMark: 100 },
  ];

  // Dynamic Calculation of Strongest/Weakest
  const sortedMetrics = [...radarData].sort((a, b) => b.value - a.value);
  const dominantTrait = sortedMetrics[0];
  const weakestLink = sortedMetrics[sortedMetrics.length - 1];

  const getScoreColor = (score: number) => {
      if (score >= 90) return '#34d399'; // Emerald 400
      if (score >= 70) return '#e11d48'; // Rose 600
      if (score >= 50) return '#f59e0b'; // Amber 500
      return '#64748b'; // Slate 500
  };

  const MetricBar = ({ label, value }: { label: string, value: number }) => (
    <div className="mb-3">
        <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider text-gray-400">
            <span>{label}</span>
            <span style={{ color: getScoreColor(value) }}>{value.toFixed(0)}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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

  const MetricCategory = ({ title, icon: Icon, metrics }: any) => (
      <div className="mb-6 bg-card/30 border border-white/5 rounded-xl p-4">
          <h3 className="text-sm font-serif font-bold text-rose-200 mb-4 flex items-center border-b border-white/5 pb-2">
              <Icon size={14} className="mr-2" /> {title}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {metrics.map((m: any) => (
                  <MetricBar key={m.label} label={m.label} value={m.value} />
              ))}
          </div>
      </div>
  );

  const InsightCard = ({ title, score, goodText, badText, icon: Icon }: any) => (
    <div className="bg-card/50 border border-white/5 p-4 rounded-xl mb-3">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${score >= 70 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <Icon size={18} />
                </div>
                <h4 className="font-bold text-gray-200">{title}</h4>
            </div>
            <span className={`text-sm font-mono font-bold ${score >= 70 ? 'text-green-400' : 'text-rose-400'}`}>
                {score.toFixed(0)}/100
            </span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
            {score >= 70 ? goodText : badText}
        </p>
    </div>
  );

  // Hand Wagging Icon for "Not Tellin'"
  const WaggingHand = () => (
    <div className="inline-block ml-1">
        <span className="inline-block text-lg animate-[wiggle_0.5s_ease-in-out_infinite]">☝️</span>
    </div>
  );

  // --- New Visual Components ---
  
  const ArchetypeBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
        'The Cupid': 'bg-pink-500/20 text-pink-300 border-pink-500/50',
        'The Hollywood': 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        'The Classic': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        'The Pillowy': 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        'The Natural': 'bg-green-500/20 text-green-300 border-green-500/50',
        'The Wide Smile': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
        'The Rosebud': 'bg-red-500/20 text-red-300 border-red-500/50',
        'Botched Job': 'bg-gray-800 text-gray-400 border-gray-600',
        'The Trout': 'bg-gray-800 text-gray-400 border-gray-600'
    };
    const style = colors[type] || colors['The Classic'];

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full border ${style} mb-4`}>
             <Heart size={12} className="mr-2 fill-current" />
             <span className="text-xs font-bold uppercase tracking-widest">{type}</span>
        </div>
    );
  };

  const GoldenRatioGauge = ({ matchScore }: { matchScore: number }) => (
      <div className="bg-card/50 p-4 rounded-xl border border-white/5 mb-4">
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-amber-400">
                  <Ruler size={16} className="mr-2" />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Golden Ratio (1:1.618)</h4>
              </div>
              <span className="text-xs font-mono text-gray-400">{matchScore.toFixed(0)}% Match</span>
          </div>
          <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
              {/* The Golden Spot Marker */}
              <div className="absolute left-[61.8%] top-0 bottom-0 w-1 bg-amber-400 z-10 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
              <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gray-700 via-rose-500 to-gray-700 opacity-50" style={{ width: '100%' }}></div>
              
              {/* User Position (Simulated mapping 0-100 match to position around golden ratio) */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ 
                    left: `${61.8 + (100 - matchScore) * (Math.random() > 0.5 ? 0.2 : -0.2)}%`,
                    boxShadow: '0 0 8px white'
                }}
              />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
              <span>1:1</span>
              <span className="text-amber-500 font-bold">1:1.618</span>
              <span>1:2</span>
          </div>
      </div>
  );

  const CosmeticIntegrityScan = ({ score }: { score: number }) => (
    <div className="bg-card/50 p-4 rounded-xl border border-white/5 mb-4">
         <div className="flex justify-between items-center mb-2">
             <div className="flex items-center text-blue-300">
                 <Fingerprint size={16} className="mr-2" />
                 <h4 className="text-sm font-bold uppercase tracking-wider">Cosmetic Integrity</h4>
             </div>
             <span className={`text-xs font-bold ${score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                 {score > 80 ? 'Natural / High Quality' : score > 50 ? 'Enhanced' : 'Integrity Compromised'}
             </span>
         </div>
         <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
             <div className="h-full bg-red-500 w-[30%] opacity-50"></div>
             <div className="h-full bg-yellow-500 w-[30%] opacity-50"></div>
             <div className="h-full bg-green-500 w-[40%] opacity-50"></div>
         </div>
         {/* Indicator */}
         <div className="relative w-full h-2 -mt-2">
              <div 
                className="absolute top-0 h-3 w-1 bg-white shadow-[0_0_8px_white]" 
                style={{ left: `${score}%`, transform: 'translateY(-2px)' }}
              ></div>
         </div>
         <div className="flex justify-between mt-2 text-[9px] text-gray-500 uppercase font-bold">
             <span>Botched</span>
             <span>Enhanced</span>
             <span>Natural</span>
         </div>
    </div>
  );

  const handleSaveNickname = () => {
      setIsEditingName(false);
      setDisplayNickname(editedName);
      // In real app, would propagate to user profile
  };

  return (
    <div className="w-full min-h-screen bg-dark pb-24 animate-fade-in overflow-y-auto no-scrollbar">
      {/* Header Image */}
      <div className="relative w-full h-80 bg-gray-900 overflow-hidden">
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4 z-30 bg-black/30 backdrop-blur-md text-white rounded-full p-2 hover:bg-black/50">
            <ArrowLeft size={24} />
        </Button>
        
        {user.allow_full_face_public && user.face_image_url ? (
             <>
                <img 
                    src={user.face_image_url} 
                    alt="Full Face" 
                    className="w-full h-full object-cover opacity-30 blur-[2px]" 
                />
             </>
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-dark">
                 <Shield className="text-gray-600 mb-2" size={48} />
                 <p className="text-gray-500 absolute bottom-4 font-serif italic">Full face is private</p>
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 via-30% to-transparent" />
        
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
        <div className="flex items-center justify-center gap-2 mb-2">
            {isEditingName ? (
                <div className="flex items-center gap-2 animate-fade-in">
                    <input 
                        type="text" 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="bg-card border border-rose-500/50 rounded px-2 py-1 text-xl font-serif font-bold text-white w-48 text-center focus:outline-none"
                    />
                    <button onClick={handleSaveNickname} className="p-1 bg-rose-600 rounded-full text-white">
                        <Save size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        {displayNickname}
                    </h1>
                    {user.isCurrentUser && (
                        <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-rose-400 transition-colors">
                            <Edit2 size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
        
        {scoring?.lipArchetype && <ArchetypeBadge type={scoring.lipArchetype} />}

        <div className="flex items-center justify-center text-rose-400 mt-1 text-sm font-medium uppercase tracking-widest">
            <MapPin size={12} className="mr-1" />
            {user.location_city === 'Unknown' ? (
                <span className="flex items-center">Not Tellin' <WaggingHand /></span>
            ) : (
                `${user.location_city}, ${user.location_country}`
            )}
        </div>

        {/* Score Hero */}
        <div className="mt-6 mb-8 relative">
            <div className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-200 to-rose-400 animate-pulse-slow">
                {user.score.toLocaleString()}
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
                <div className="animate-fade-in space-y-4">
                    {/* 1. Radar Chart */}
                    <div className="h-72 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid gridType="polygon" stroke="#334155" strokeWidth={0.5} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Lips"
                                    dataKey="value"
                                    stroke="#e11d48"
                                    strokeWidth={3}
                                    fill="#e11d48"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2. Golden Ratio Visual */}
                    {scoring?.goldenRatioMatch !== undefined && (
                        <GoldenRatioGauge matchScore={scoring.goldenRatioMatch} />
                    )}

                    {/* 3. Cosmetic Integrity Scan (Replaces Lip Age / Scatter) */}
                    {scoring?.cosmeticIntegrity !== undefined && (
                        <CosmeticIntegrityScan score={scoring.cosmeticIntegrity} />
                    )}

                    {/* 4. Traits */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                         <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-lg shadow-rose-900/10">
                             <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Dominant Trait</div>
                             <div className="text-lg font-bold text-rose-400 truncate">{dominantTrait.fullLabel}</div>
                             <div className="text-xs text-gray-400 mt-1 font-mono">{dominantTrait.value.toFixed(1)}/100</div>
                         </div>
                         <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-lg shadow-black/20">
                             <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Weakest Link</div>
                             <div className="text-lg font-bold text-gray-300 truncate">{weakestLink.fullLabel}</div>
                             <div className="text-xs text-gray-500 mt-1 font-mono">{weakestLink.value.toFixed(1)}/100</div>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'metrics' && (
                <div className="text-left animate-fade-in px-2 pb-10">
                    <div className="grid grid-cols-1 gap-4">
                        <MetricCategory 
                            title="Architecture (Shape)" 
                            icon={BoxSelect}
                            metrics={[
                                { label: "Cupid's Bow", value: details.cupidBowPrecision },
                                { label: "Philtrum Depth", value: details.philtrumDepth },
                                { label: "Vermilion Contrast", value: details.vermilionContrast },
                                { label: "Corner Definition", value: details.cornerDefinition },
                                { label: "Lateral Volume", value: details.lateralVolume },
                                { label: "Lower Lip Pout", value: details.lowerLipPout },
                            ]}
                        />
                        
                        <MetricCategory 
                            title="Surface Ecology" 
                            icon={Droplets}
                            metrics={[
                                { label: "Hydration", value: details.hydration },
                                { label: "Smoothness", value: details.smoothness },
                                { label: "Border Sharpness", value: details.borderDefinition },
                                { label: "Vertical Lines", value: details.verticalLineScore },
                                { label: "Natural Gloss", value: details.naturalGloss },
                                { label: "Collagen/Health", value: details.skinHealth },
                            ]}
                        />

                        <MetricCategory 
                            title="Chromatic Depth" 
                            icon={Palette}
                            metrics={[
                                { label: "Vitality", value: details.vitality },
                                { label: "Uniformity", value: details.uniformity },
                                { label: "Pigment Depth", value: details.pigmentationDepth },
                                { label: "Gradient Smoothness", value: details.gradientSmoothness },
                            ]}
                        />

                        <MetricCategory 
                            title="Harmonic Ratios" 
                            icon={Grid}
                            metrics={[
                                { label: "Symmetry Balance", value: details.symmetryBalance },
                                { label: "Width Proportion", value: details.widthProportion },
                                { label: "Vertical Ratio", value: details.verticalRatio },
                                { label: "Upper/Lower Balance", value: details.upperLowerBalance },
                                { label: "Smile Potential", value: details.cornerUplift },
                            ]}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="text-left animate-fade-in">
                    <h3 className="text-lg font-serif text-white mb-6">Scientific Analysis</h3>
                    
                    <InsightCard 
                        title="Structural Harmony"
                        icon={Layers}
                        score={details.upperLowerBalance}
                        goodText="Your upper-to-lower lip ratio approaches the 1:1.618 Golden Ratio. This balance is classically associated with high aesthetic appeal."
                        badText="The vertical balance deviates from the Golden Ratio (1:1.618). This creates a distinctive look, though classical aesthetics favor the 1:1.6 proportion."
                    />

                    <InsightCard 
                        title="Vermilion Definition"
                        icon={BoxSelect}
                        score={details.borderDefinition}
                        goodText="High border definition detected. A crisp vermilion border suggests youthful collagen levels and strong structural integrity."
                        badText="The vermilion border appears slightly blurred. This can occur naturally or with volume loss. Lip liner can artificially boost this score."
                    />

                    <InsightCard 
                        title="Cupid's Bow Architecture"
                        icon={Sparkles}
                        score={details.cupidBowPrecision}
                        goodText="Your Cupid's bow is distinct and well-defined. This 'M' shape is a key marker of the 'Classic' and 'Hollywood' archetypes."
                        badText="Your Cupid's bow is softer and more rounded. This contributes to a 'Pillowy' or 'Natural' archetype rather than a structured one."
                    />

                    <InsightCard 
                        title="Surface Hydration"
                        icon={Activity}
                        score={details.hydration}
                        goodText="Excellent light reflection indicates strong hydration. Healthy lips naturally reflect light in specific specular highlights."
                        badText="Surface texture analysis suggests dryness or lack of gloss. Hydration is the fastest way to improve your overall score."
                    />
                </div>
            )}
        </div>

        <div className="mt-12 mb-6">
            <Button variant="primary" className="w-full" onClick={onShare}>
                <Share2 size={18} className="mr-2" /> Share Analysis
            </Button>
        </div>
      </div>
    </div>
  );
};
