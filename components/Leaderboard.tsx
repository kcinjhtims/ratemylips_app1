
import React, { useState } from 'react';
import { UserProfile, ArchitectProfile } from '../types';
import { Trophy, User as UserIcon, ShieldCheck, MapPin, Award, Activity } from 'lucide-react';
import { MOCK_ARCHITECTS } from '../services/mockData';

interface LeaderboardProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'architects'>('users');

  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-300">
          Global Rankings
        </h2>
        <p className="text-gray-400 text-xs mt-1">Real-time aesthetic performance analysis</p>
      </div>

      <div className="px-6 mb-6 flex gap-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'users' ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-500'
            }`}
          >
              Clients
          </button>
          <button 
            onClick={() => setActiveTab('architects')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'architects' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40' : 'bg-white/5 text-gray-500'
            }`}
          >
              Architects
          </button>
      </div>

      <div className="space-y-2 px-4 overflow-y-auto max-h-[65vh] no-scrollbar pb-10">
        {activeTab === 'users' ? (
            users.map((user) => (
                <div 
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={`group backdrop-blur-sm border transition-all duration-300 rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer ${
                    user.isCurrentUser 
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/20' 
                        : 'bg-card/40 border-white/5 hover:bg-card/60'
                    }`}
                >
                    <div className="w-8 flex-shrink-0 flex justify-center text-xs font-mono font-bold text-gray-500">
                        {user.rank <= 3 ? <Trophy size={14} className={user.rank === 1 ? 'text-yellow-400' : 'text-gray-400'} /> : `#${user.rank}`}
                    </div>
                    <div className="w-12 h-6 rounded-full overflow-hidden ring-1 ring-white/10">
                        <img src={user.lip_image_url} alt="lips" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-gray-200 truncate">{user.nickname}</h3>
                            <span className={`text-[7px] font-black px-1 rounded uppercase ${user.status === 'Natural' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {user.status}
                            </span>
                        </div>
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">{user.location_city}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold font-mono text-rose-400">{user.score}</div>
                        <div className="text-[8px] text-gray-600 uppercase font-bold">PTS</div>
                    </div>
                </div>
            ))
        ) : (
            MOCK_ARCHITECTS.map((architect, idx) => (
                <div 
                    key={architect.id}
                    className="bg-card/40 border border-sky-500/20 rounded-2xl p-4 group hover:bg-sky-950/20 transition-all cursor-pointer"
                >
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-sky-900/30 border border-sky-500/30 overflow-hidden">
                                <img src={architect.portfolio[0]} className="w-full h-full object-cover" alt="" />
                            </div>
                            {architect.verified && (
                                <div className="absolute -top-1 -right-1 bg-sky-500 rounded-full p-1 border-2 border-dark shadow-lg">
                                    <ShieldCheck size={10} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">{architect.name}</h3>
                            <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                                <MapPin size={10} className="text-sky-500" /> {architect.location}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                     <Award size={10} className="text-amber-500" />
                                     <span className="text-[8px] text-amber-500 font-black uppercase">Tier 1 Elite</span>
                                </div>
                                <div className="flex items-center gap-1">
                                     <Activity size={10} className="text-emerald-500" />
                                     <span className="text-[8px] text-emerald-500 font-black uppercase">{architect.totalProcedures}+ Ops</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-sky-400 font-mono leading-none">{architect.engineeringScore}</div>
                            <div className="text-[7px] font-black text-gray-500 uppercase tracking-tighter">ENGINEERING SCORE</div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
