import React from 'react';
import { UserProfile } from '../types';
import { Trophy, MapPin } from 'lucide-react';

interface LeaderboardProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onSelectUser }) => {
  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-300">
          Global Top Lips
        </h2>
        <p className="text-gray-400 text-sm mt-1">Daily rankings based on AI analysis</p>
      </div>

      <div className="space-y-3 px-4">
        {users.map((user) => (
          <div 
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="group bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-card/80 transition-all"
          >
            <div className="w-12 flex-shrink-0 flex justify-center">
              {user.rank <= 3 ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  user.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-amber-700/20 text-amber-600'
                }`}>
                  <Trophy size={16} fill="currentColor" />
                </div>
              ) : (
                <span className="text-gray-500 font-mono font-bold">#{user.rank}</span>
              )}
            </div>

            <div className="relative">
                {/* Tic-tac shape mask */}
                <div className="w-20 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-rose-500/50 transition-all">
                    <img src={user.lip_image_url} alt="lips" className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-gray-200 truncate">{user.nickname}</h3>
                <div className="flex items-center text-xs text-gray-500 truncate">
                    <MapPin size={10} className="mr-1" />
                    {user.location_city}, {user.location_country}
                </div>
            </div>

            <div className="text-right">
                <div className="text-xl font-bold font-mono text-rose-400">
                    {(user.score / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};