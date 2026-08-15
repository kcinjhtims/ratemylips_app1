
import React, { useState, useEffect } from 'react';
import { Camera, User as UserIcon, BarChart2, CheckCircle2, Star, ShieldCheck, Activity, Beaker } from 'lucide-react';
import { AppView, UserProfile, ScoringResult, LipStatus } from './types';
import { LipCropper } from './components/LipCropper';
import { Leaderboard } from './components/Leaderboard';
import { ProfileView } from './components/ProfileView';
import { TestBench } from './components/TestBench';
import { Button } from './components/Button';
import { calculateLipScore, extractFeaturesFromImage, seedRandom, generateNickname, generateProcedureBlueprint } from './services/scoringEngine';
import { analyzeImagePixels } from './services/imageAnalysis';
import { MOCK_LEADERBOARD } from './services/mockData';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [showLab, setShowLab] = useState(false);
  const [uploadedFrontImage, setUploadedFrontImage] = useState<string | null>(null);
  const [croppedFrontLipImage, setCroppedFrontLipImage] = useState<string | null>(null);
  const [uploadedSideImage, setUploadedSideImage] = useState<string | null>(null);
  const [croppedSideLipImage, setCroppedSideLipImage] = useState<string | null>(null);
  
  const [lipStatus, setLipStatus] = useState<LipStatus>('Natural');
  
  // Muse States
  const [uploadedMuseImage, setUploadedMuseImage] = useState<string | null>(null);
  const [croppedMuseLipImage, setCroppedMuseLipImage] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_LEADERBOARD);

  const steps = [
    "Initializing Zonal Scanning...",
    "Reconstructing Geometric Symmetry...",
    "Tracing Vermilion Contrast...",
    "Mapping 3D Volumetric Ratios...",
    "Finalizing Aesthetic Report..."
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setAnalysisStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setAnalysisStep(0);
    }
  }, [isProcessing]);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFrontImage(event.target?.result as string);
        setCurrentView('cropFront');
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (frontCrop: string, sideCrop: string) => {
    setIsProcessing(true);
    const uniqueString = (frontCrop + sideCrop).slice(0, 500); 
    seedRandom(uniqueString);

    try {
        const [frontStats, sideStats] = await Promise.all([
          analyzeImagePixels(frontCrop),
          analyzeImagePixels(sideCrop)
        ]);
        
        setTimeout(() => {
            const frontFeatures = extractFeaturesFromImage(frontStats);
            const sideFeatures = extractFeaturesFromImage(sideStats);
            
            // Adjust logic based on LipStatus
            if (lipStatus === 'Filled') {
                frontFeatures.filler_migration_index += 0.2; 
                frontFeatures.duck_lip_index += 0.1;
            }

            const frontResult = calculateLipScore(frontFeatures);
            const sideResult = calculateLipScore(sideFeatures);
            const finalScore = Math.round(frontResult.totalScore * 0.7 + sideResult.totalScore * 0.3);
            const autoNickname = generateNickname(finalScore, frontFeatures);

            const newUser: UserProfile = {
                id: Date.now().toString(),
                email: 'guest@example.com',
                fingerprint: uniqueString,
                nickname: autoNickname,
                location_city: 'Los Angeles',
                location_country: 'USA',
                country_code: 'US',
                status: lipStatus,
                lip_image_url: frontCrop,
                face_image_url: uploadedFrontImage || '',
                side_lip_image_url: sideCrop,
                side_face_image_url: uploadedSideImage || '',
                allow_full_face_public: true,
                score: finalScore,
                rank: 0,
                features: frontFeatures,
                scoringResult: frontResult,
                isCurrentUser: true
            };

            const updatedUsers = [...users, newUser].sort((a, b) => b.score - a.score);
            updatedUsers.forEach((u, idx) => u.rank = idx + 1);

            setUsers(updatedUsers);
            setCurrentUser(newUser);
            setIsProcessing(false);
            setCurrentView('result');
        }, 3000);

    } catch (e) {
        setIsProcessing(false);
    }
  };

  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in bg-gradient-to-b from-rose-900/20 to-dark">
      <button 
        onClick={() => setShowLab(true)}
        className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-gray-600 hover:text-rose-500 transition-colors"
      >
        <Beaker size={20} />
      </button>

      <h1 className="text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-200 mb-4">
        RateMyLips
      </h1>
      <p className="text-gray-400 max-w-xs mb-12 text-lg leading-relaxed italic">
        "Biometric Volumetric Analysis for Aesthetic Perfection."
      </p>

      <div className="w-full max-w-xs space-y-4">
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Select Analysis Mode</h3>
              
              <button 
                onClick={() => setLipStatus('Natural')}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                    lipStatus === 'Natural' ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-white/5 border-transparent text-gray-500'
                }`}
              >
                  <div className="text-left">
                      <div className="text-sm font-black uppercase">Natural</div>
                      <div className="text-[9px] font-bold opacity-60">Enhancement focus</div>
                  </div>
                  <CheckCircle2 size={18} className={lipStatus === 'Natural' ? 'text-rose-400' : 'opacity-0'} />
              </button>

              <button 
                onClick={() => setLipStatus('Filled')}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                    lipStatus === 'Filled' ? 'bg-sky-600/20 border-sky-500 text-white' : 'bg-white/5 border-transparent text-gray-500'
                }`}
              >
                  <div className="text-left">
                      <div className="text-sm font-black uppercase">Filled</div>
                      <div className="text-[9px] font-bold opacity-60">Audit & maintenance focus</div>
                  </div>
                  <ShieldCheck size={18} className={lipStatus === 'Filled' ? 'text-sky-400' : 'opacity-0'} />
              </button>
          </div>

          <Button onClick={() => setCurrentView('uploadFront')} className="w-full text-lg h-14 shadow-2xl">
             Start Analysis
          </Button>
      </div>
      
      <button 
        onClick={() => setCurrentView('leaderboard')}
        className="mt-12 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
      >
        View Architect Rankings
      </button>
    </div>
  );

  const renderUpload = (type: 'front' | 'side' | 'muse') => (
    <div className="flex flex-col h-screen animate-fade-in bg-dark">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
         <div className="w-full max-w-md border-2 border-dashed border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center bg-card/30">
            <div className="mb-4 bg-white/5 px-4 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {type === 'muse' ? 'Reference Architecture' : `Anatomical Scan ${type === 'front' ? '1/2' : '2/2'}`}
            </div>
            <div className={`w-20 h-20 ${type === 'muse' ? 'bg-amber-500/10' : 'bg-rose-500/10'} rounded-full flex items-center justify-center mb-6`}>
                {type === 'muse' ? <Star className="text-amber-500" size={32} /> : <Camera className="text-rose-500" size={32} />}
            </div>
            <h2 className="text-2xl font-black text-white mb-2 text-center uppercase tracking-tight">
                {type === 'front' ? 'Frontal' : type === 'side' ? 'Lateral' : 'Goal Persona'}
            </h2>
            <p className="text-gray-500 text-center mb-10 text-xs font-bold leading-relaxed max-w-[200px]">
                {type === 'front' ? 'Align lips horizontally within the guide.' : 
                 type === 'side' ? '90 degree turn for projection analytics.' : 
                 'Upload the target anatomy for blueprint matching.'}
            </p>
            
            <label className="w-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={type === 'front' ? handleFrontUpload : type === 'side' ? (e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                          const r = new FileReader();
                          r.onload = (ev) => {
                              setUploadedSideImage(ev.target?.result as string);
                              setCurrentView('cropSide');
                          };
                          r.readAsDataURL(file);
                      }
                  } : (e) => {
                    const file = e.target.files?.[0];
                    if(file) {
                        const r = new FileReader();
                        r.onload = (ev) => {
                            setUploadedMuseImage(ev.target?.result as string);
                            setCurrentView('cropMuse');
                        };
                        r.readAsDataURL(file);
                    }
                  }} 
                  className="hidden" 
                />
                <div className={`w-full ${type === 'muse' ? 'bg-amber-600' : 'bg-white'} text-dark font-black py-4 rounded-2xl text-center cursor-pointer hover:opacity-90 transition-all uppercase tracking-widest text-[10px]`}>
                    Select Capture
                </div>
            </label>
         </div>
      </div>
      
      <div className="p-6">
         <Button variant="ghost" onClick={() => setCurrentView('onboarding')} className="w-full text-[10px] uppercase font-black tracking-widest">
            Back
         </Button>
      </div>
    </div>
  );

  const BottomNav = () => (
      <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-2xl border-t border-white/5 p-4 flex justify-around items-center z-40 h-20">
          <button 
            onClick={() => setCurrentView('leaderboard')}
            className={`flex flex-col items-center ${currentView === 'leaderboard' ? 'text-rose-500' : 'text-gray-600'}`}
          >
              <BarChart2 size={24} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Ranks</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('onboarding')}
            className="bg-gradient-to-r from-rose-500 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center -mt-10 shadow-lg shadow-rose-500/40 border-4 border-dark"
          >
              <Camera size={20} className="text-white" />
          </button>

          <button 
            onClick={() => {
                if(currentUser) setCurrentView('result');
                else setCurrentView('onboarding');
            }}
            className={`flex flex-col items-center ${currentView === 'result' || currentView === 'profile' ? 'text-rose-500' : 'text-gray-600'}`}
          >
              <UserIcon size={24} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Me</span>
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
        {showLab && <TestBench onClose={() => setShowLab(false)} />}
        {currentView === 'onboarding' && renderOnboarding()}
        {currentView === 'uploadFront' && renderUpload('front')}
        {currentView === 'cropFront' && uploadedFrontImage && (
            <LipCropper 
                imageUrl={uploadedFrontImage} 
                onConfirm={(url) => { setCroppedFrontLipImage(url); setCurrentView('uploadSide'); }} 
                onCancel={() => setCurrentView('uploadFront')} 
            />
        )}
        {currentView === 'uploadSide' && renderUpload('side')}
        {currentView === 'cropSide' && uploadedSideImage && (
            <LipCropper 
                imageUrl={uploadedSideImage} 
                onConfirm={(url) => { setCroppedSideLipImage(url); setCurrentView('analyzing'); startAnalysis(croppedFrontLipImage!, url); }} 
                onCancel={() => setCurrentView('uploadSide')} 
            />
        )}
        {currentView === 'uploadMuse' && renderUpload('muse')}
        {currentView === 'cropMuse' && uploadedMuseImage && (
            <LipCropper 
                imageUrl={uploadedMuseImage} 
                onConfirm={async (url) => {
                    setCroppedMuseLipImage(url);
                    setCurrentView('analyzing');
                    setIsProcessing(true);
                    const stats = await analyzeImagePixels(url);
                    const feat = extractFeaturesFromImage(stats);
                    const res = calculateLipScore(feat);
                    if(currentUser) {
                        const bp = generateProcedureBlueprint(currentUser.features!, feat);
                        const updated = {...currentUser, muse_lip_url: url, muse_scoring_result: res, muse_blueprint: bp, muse_match_score: 85 };
                        setCurrentUser(updated);
                    }
                    setTimeout(() => { setIsProcessing(false); setCurrentView('result'); }, 2000);
                }} 
                onCancel={() => setCurrentView('result')} 
            />
        )}
        {currentView === 'analyzing' && (
            <div className="flex flex-col h-screen items-center justify-center bg-dark">
                <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-8" />
                <h3 className="text-xl font-black uppercase tracking-widest">{steps[analysisStep]}</h3>
            </div>
        )}
        {(currentView === 'result' && currentUser) && (
             <>
                <ProfileView 
                    user={currentUser} 
                    scoring={currentUser.scoringResult} 
                    onBack={() => setCurrentView('leaderboard')}
                    onUploadMuse={() => setCurrentView('uploadMuse')}
                />
                <BottomNav />
             </>
        )}
        {currentView === 'leaderboard' && (
            <>
                <Leaderboard 
                    users={users} 
                    onSelectUser={(u) => { setSelectedUser(u); setCurrentView('profile'); }} 
                />
                <BottomNav />
            </>
        )}
        {currentView === 'profile' && selectedUser && (
             <ProfileView 
                key={selectedUser.id}
                user={selectedUser} 
                scoring={selectedUser.scoringResult}
                onBack={() => setCurrentView('leaderboard')}
                onUploadMuse={() => setCurrentView('uploadMuse')}
            />
        )}
    </div>
  );
};

export default App;
