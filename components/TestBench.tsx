
import React, { useState, useEffect } from 'react';
import { LipFeatures, ScoringResult, LipStatus } from '../types';
import { calculateLipScore } from '../services/scoringEngine';
import { SYNTHETIC_PERSONAS } from '../services/testSuite';
import { Beaker, RefreshCcw, AlertCircle, CheckCircle2, Sliders, Activity } from 'lucide-react';
import { Button } from './Button';

interface TestBenchProps {
  onClose: () => void;
}

export const TestBench: React.FC<TestBenchProps> = ({ onClose }) => {
  const [selectedPersona, setSelectedPersona] = useState(SYNTHETIC_PERSONAS[0]);
  const [localFeatures, setLocalFeatures] = useState<LipFeatures>(SYNTHETIC_PERSONAS[0].features);
  const [status, setStatus] = useState<LipStatus>(SYNTHETIC_PERSONAS[0].status);
  const [result, setResult] = useState<ScoringResult>(calculateLipScore(localFeatures));

  useEffect(() => {
    setResult(calculateLipScore(localFeatures));
  }, [localFeatures]);

  const updateFeature = (key: keyof LipFeatures, val: number) => {
    setLocalFeatures(prev => ({ ...prev, [key]: val }));
  };

  const loadPersona = (p: typeof SYNTHETIC_PERSONAS[0]) => {
    setSelectedPersona(p);
    setLocalFeatures(p.features);
    setStatus(p.status);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark flex flex-col animate-fade-in overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-card/50">
          <div className="flex items-center gap-3">
              <Beaker className="text-rose-500" />
              <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter">Aesthetic Lab</h2>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Algorithm Validation v4.2</p>
              </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Exit Lab</Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Persona Selection */}
          <div className="w-full md:w-64 border-r border-white/5 p-4 space-y-2 overflow-y-auto bg-black/20">
              <h3 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Standard Benchmarks</h3>
              {SYNTHETIC_PERSONAS.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => loadPersona(p)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedPersona.name === p.name ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-white/5 border-transparent text-gray-500'
                    }`}
                  >
                      <div className="text-[11px] font-black uppercase">{p.name}</div>
                      <div className="text-[8px] opacity-60 mt-1 leading-tight">{p.description}</div>
                  </button>
              ))}
          </div>

          {/* Controls */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-dark custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                      <h3 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase mb-6 tracking-widest">
                          <Sliders size={14} /> Geometry & Ratio
                      </h3>
                      <SliderControl label="Upper Lip Height" val={localFeatures.upper_lip_height} min={0.2} max={2.0} onChange={v => updateFeature('upper_lip_height', v)} />
                      <SliderControl label="Lower Lip Height" val={localFeatures.lower_lip_height} min={0.2} max={2.0} onChange={v => updateFeature('lower_lip_height', v)} />
                      <SliderControl label="Symmetry (L/R)" val={localFeatures.left_lip_area / localFeatures.right_lip_area} min={0.1} max={2.0} onChange={v => {
                          updateFeature('left_lip_area', v * 2.5);
                          updateFeature('right_lip_area', 2.5);
                      }} />
                  </section>

                  <section>
                      <h3 className="flex items-center gap-2 text-[10px] font-black text-sky-500 uppercase mb-6 tracking-widest">
                          <Activity size={14} /> Integrity & Audit
                      </h3>
                      <SliderControl label="Duck Lip Index" val={localFeatures.duck_lip_index} min={0} max={1} onChange={v => updateFeature('duck_lip_index', v)} />
                      <SliderControl label="Filler Migration" val={localFeatures.filler_migration_index} min={0} max={1} onChange={v => updateFeature('filler_migration_index', v)} />
                      <SliderControl label="Lumpiness" val={localFeatures.lumpy_texture_index} min={0} max={1} onChange={v => updateFeature('lumpy_texture_index', v)} />
                  </section>
              </div>
          </div>

          {/* Real-time Results Dashboard */}
          <div className="w-full md:w-80 border-l border-white/5 bg-card/30 p-6">
              <div className="text-center mb-8">
                  <div className="text-6xl font-mono font-bold text-white mb-2">{result.totalScore}</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Analytic Output</div>
              </div>

              <div className="space-y-4">
                  <ResultRow label="Archetype" val={result.lipArchetype} highlight={result.lipArchetype === selectedPersona.expectedArchetype} />
                  <ResultRow label="Golden Ratio" val={`${result.goldenRatioMatch.toFixed(1)}%`} />
                  <ResultRow label="Integrity" val={`${result.cosmeticIntegrity.toFixed(1)}%`} />
                  
                  <div className="pt-6 mt-6 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Logic Flags</h4>
                      {localFeatures.duck_lip_index > 0.6 && (
                          <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 p-2 rounded-lg text-[10px] font-bold uppercase mb-2">
                              <AlertCircle size={14} /> Trout Penalty Active
                          </div>
                      )}
                      {result.cosmeticIntegrity < 50 && (
                          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-2 rounded-lg text-[10px] font-bold uppercase">
                              <AlertCircle size={14} /> Botched Integrity Alert
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const SliderControl = ({ label, val, min, max, onChange }: any) => (
    <div className="mb-6">
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
            <span>{label}</span>
            <span className="text-white font-mono">{val.toFixed(2)}</span>
        </div>
        <input 
            type="range" min={min} max={max} step="0.01" value={val} 
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
    </div>
);

const ResultRow = ({ label, val, highlight }: any) => (
    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
        <span className="text-[10px] text-gray-400 font-bold uppercase">{label}</span>
        <span className={`text-xs font-black uppercase ${highlight ? 'text-emerald-400' : 'text-white'}`}>{val}</span>
    </div>
);
