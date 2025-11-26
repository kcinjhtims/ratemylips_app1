
import React from 'react';
import { UserProfile } from '../types';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onSelectUser }) => {
  return (
    <div className="w-full max-w-md mx-auto pb-24 animate-fade-in">
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-300">
          Global Top Lips
        </h2>
        <p className="text-gray-400 text-xs mt-1">Daily rankings based on AI analysis</p>
      </div>

      <div className="space-y-1 px-4">
        {users.map((user) => (
          <div 
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="group bg-card/50 backdrop-blur-sm border border-white/5 rounded-lg py-3 px-3 flex items-center gap-3 cursor-pointer hover:bg-card/80 transition-all"
          >
            <div className="w-6 flex-shrink-0 flex justify-center">
              {user.rank <= 3 ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  user.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  'bg-amber-700/20 text-amber-600'
                }`}>
                  <Trophy size={10} fill="currentColor" />
                </div>
              ) : (
                <span className="text-gray-500 font-mono font-bold text-xs">#{user.rank}</span>
              )}
            </div>

            <div className="relative">
                {/* Reduced image size for 50% height reduction impact */}
                <div className="w-10 h-5 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-rose-500/50 transition-all">
                    <img src={user.lip_image_url} alt="lips" className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex-grow min-w-0 flex items-center gap-2 ml-1">
                {/* Country Flag */}
                {user.country_code && (
                   <img 
                      src={`https://flagcdn.com/w20/${user.country_code.toLowerCase()}.png`} 
                      className="w-4 h-4 rounded-full object-cover border border-white/10 shadow-sm flex-shrink-0"
                      alt={user.country_code}
                   />
                )}
                {/* Nickname only (removed location text for height reduction) */}
                <h3 className="font-bold text-sm text-gray-200 truncate">{user.nickname}</h3>
            </div>

            <div className="text-right">
                <div className="text-sm font-bold font-mono text-rose-400 tracking-tight">
                    {user.score}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
