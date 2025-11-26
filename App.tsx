
import React, { useState, useEffect } from 'react';
import { Upload, Camera, X, ArrowRight, User as UserIcon, BarChart2, Mail } from 'lucide-react';
import { AppView, UserProfile, ScoringResult } from './types';
import { LipCropper } from './components/LipCropper';
import { Leaderboard } from './components/Leaderboard';
import { ProfileView } from './components/ProfileView';
import { Button } from './components/Button';
import { calculateLipScore, extractFeaturesFromImage, seedRandom, generateNickname } from './services/scoringEngine';
import { analyzeImagePixels } from './services/imageAnalysis';
import { MOCK_LEADERBOARD } from './services/mockData';

const App = () => {
  // State
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [userEmail, setUserEmail] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedLipImage, setCroppedLipImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_LEADERBOARD);
  const [allowPublicFace, setAllowPublicFace] = useState(true);

  // Handlers
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(userEmail.includes('@')) {
        setCurrentView('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCroppedLipImage(null); 
        setCurrentView('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = (croppedUrl: string) => {
    setCroppedLipImage(croppedUrl);
    setCurrentView('analyzing');
    startAnalysis(croppedUrl);
  };

  const startAnalysis = async (activeCropUrl: string) => {
    setIsProcessing(true);
    
    // 1. Initialize Seed based on Email + Image Data (Deterministic)
    const uniqueString = userEmail + activeCropUrl.slice(0, 100); 
    seedRandom(uniqueString);

    // 2. PERFORM REAL COMPUTER VISION ANALYSIS
    try {
        const realImageStats = await analyzeImagePixels(activeCropUrl);
        
        // Simulate Network/Compute delay
        setTimeout(() => {
            // 3. Extract Features using REAL stats + Seeded Randomness for shape
            const features = extractFeaturesFromImage(realImageStats);
            
            // 4. Calculate Score
            const result = calculateLipScore(features);
            
            // 5. Auto-Generate Nickname
            const autoNickname = generateNickname(result.totalScore, features);

            // 6. Create User Profile
            const newUser: UserProfile = {
                id: Date.now().toString(),
                email: userEmail,
                fingerprint: uniqueString,
                nickname: autoNickname,
                location_city: 'Unknown',
                location_country: 'Unknown',
                country_code: 'US',
                lip_image_url: activeCropUrl,
                face_image_url: uploadedImage || '',
                allow_full_face_public: allowPublicFace,
                score: result.totalScore,
                rank: 0,
                features: features,
                scoringResult: result,
                isCurrentUser: true
            };

            const updatedUsers = [...users, newUser].sort((a, b) => b.score - a.score);
            updatedUsers.forEach((u, idx) => u.rank = idx + 1);

            setUsers(updatedUsers);
            setCurrentUser(newUser);
            setIsProcessing(false);
            setCurrentView('result');
        }, 2000);

    } catch (e) {
        console.error("Analysis failed", e);
        setIsProcessing(false);
    }
  };

  // Render Helpers
  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in bg-gradient-to-b from-rose-900/20 to-dark">
      <h1 className="text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-200 mb-4">
        RateMyLips
      </h1>
      <p className="text-gray-400 max-w-xs mb-12 text-lg leading-relaxed">
        AI-powered aesthetic analysis. Discover your symmetry, score, and global rank.
      </p>
      <Button onClick={() => setCurrentView('email-input')} className="w-full max-w-xs text-lg h-14">
        Start Analysis
      </Button>
      <button 
        onClick={() => setCurrentView('leaderboard')}
        className="mt-6 text-gray-500 text-sm hover:text-white transition-colors"
      >
        View Global Leaderboard
      </button>
    </div>
  );

  const renderEmailInput = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-rose-400" size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">Verify Identity</h2>
                <p className="text-gray-400 text-sm">We use your email to create a unique fingerprint for your lips. This prevents spam and ensures consistent scoring.</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input 
                    type="email" 
                    required
                    placeholder="Enter your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-card border border-gray-700 rounded-xl p-4 text-white focus:border-rose-500 focus:outline-none transition-colors"
                />
                <Button type="submit" className="w-full h-12">
                    Continue <ArrowRight size={18} className="ml-2" />
                </Button>
            </form>
            
            <Button variant="ghost" onClick={() => setCurrentView('onboarding')} className="w-full mt-4">
                Back
            </Button>
        </div>
    </div>
  );

  const renderUpload = () => (
    <div className="flex flex-col h-screen animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
         <div className="w-full max-w-md border-2 border-dashed border-gray-700 rounded-3xl p-10 flex flex-col items-center justify-center bg-card/30">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                <Camera className="text-rose-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Selfie</h2>
            <p className="text-gray-500 text-center mb-8 text-sm">
                Ensure good lighting. Face front. Neutral expression or slight smile.
            </p>
            
            <label className="w-full">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-full bg-white text-rose-600 font-bold py-4 rounded-full text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    Choose Photo
                </div>
            </label>
         </div>
      </div>
      
      <div className="p-6">
         <Button variant="ghost" onClick={() => setCurrentView('email-input')} className="w-full">
            Back
         </Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col h-screen items-center justify-center bg-dark animate-fade-in">
      <div className="relative w-32 h-32">
         <div className="absolute inset-0 border-4 border-rose-900/30 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
         {croppedLipImage && (
             <div className="absolute inset-2 rounded-full overflow-hidden opacity-50 animate-pulse">
                 <img src={croppedLipImage} className="w-full h-full object-cover" alt="analyzing" />
             </div>
         )}
      </div>
      <h3 className="text-xl font-bold text-white mt-8 animate-pulse">Analyzing Pixels...</h3>
      <p className="text-gray-500 mt-2 text-sm">Scanning redness, contrast, and texture.</p>
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
      <div className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-lg border-t border-white/5 p-4 flex justify-around items-center z-40">
          <button 
            onClick={() => setCurrentView('leaderboard')}
            className={`flex flex-col items-center ${currentView === 'leaderboard' ? 'text-rose-500' : 'text-gray-500'}`}
          >
              <BarChart2 size={24} />
              <span className="text-[10px] mt-1">Rankings</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('upload')}
            className="bg-gradient-to-r from-rose-500 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-rose-500/40 border-4 border-dark"
          >
              <Camera size={20} className="text-white" />
          </button>

          <button 
            onClick={() => {
                if(currentUser) setCurrentView('result'); // Go to own result
                else setCurrentView('upload'); // Or upload prompt
            }}
            className={`flex flex-col items-center ${currentView === 'result' || currentView === 'profile' ? 'text-rose-500' : 'text-gray-500'}`}
          >
              <UserIcon size={24} />
              <span className="text-[10px] mt-1">Profile</span>
          </button>
      </div>
  );

  // Main Switch
  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
        {currentView === 'onboarding' && renderOnboarding()}
        
        {currentView === 'email-input' && renderEmailInput()}

        {currentView === 'upload' && renderUpload()}
        
        {currentView === 'crop' && uploadedImage && (
            <LipCropper 
                imageUrl={uploadedImage} 
                onConfirm={handleCropConfirm} 
                onCancel={() => setCurrentView('upload')} 
            />
        )}

        {currentView === 'analyzing' && renderAnalyzing()}

        {currentView === 'result' && currentUser && (
             <>
                <ProfileView 
                    user={currentUser} 
                    scoring={currentUser.scoringResult} 
                    onBack={() => setCurrentView('leaderboard')}
                    onShare={() => setCurrentView('leaderboard')}
                />
                <BottomNav />
             </>
        )}

        {currentView === 'leaderboard' && (
            <>
                <Leaderboard 
                    users={users} 
                    onSelectUser={(u) => {
                        setSelectedUser(u);
                        setCurrentView('profile');
                    }} 
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
                onShare={() => setCurrentView('leaderboard')}
            />
        )}
    </div>
  );
};

export default App;
