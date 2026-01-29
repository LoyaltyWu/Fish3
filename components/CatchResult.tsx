
import React from 'react';
import { CaughtFish, Rarity } from '../types';

interface CatchResultProps {
  fish: CaughtFish;
  onCollect: () => void;
}

const CatchResult: React.FC<CatchResultProps> = ({ fish, onCollect }) => {
  const getRarityClass = () => {
    switch (fish.rarity) {
      case Rarity.RARE: return 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]';
      case Rarity.EPIC: return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]';
      case Rarity.LEGENDARY: return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,1)]';
      default: return 'text-gray-300';
    }
  };

  // Scale fish visual based on length (normalized roughly)
  const fishScale = Math.min(1.5, 0.5 + fish.length / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="w-full max-w-sm bg-slate-800 rounded-3xl border-4 border-sky-400 p-8 flex flex-col items-center animate-in zoom-in-90 duration-300">
        <h2 className="text-3xl font-black text-center mb-6 text-white uppercase tracking-wider">You caught something!</h2>

        {/* Chibi Character Placeholder */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-pulse"></div>
          {/* Chibi character */}
          <svg viewBox="0 0 100 100" className="w-32 h-32 absolute bottom-0">
             <circle cx="50" cy="35" r="20" fill="#ffedd5" /> {/* Head */}
             <rect x="35" y="55" width="30" height="40" rx="10" fill="#3b82f6" /> {/* Body */}
             <circle cx="43" cy="32" r="2" fill="black" /> {/* L Eye */}
             <circle cx="57" cy="32" r="2" fill="black" /> {/* R Eye */}
          </svg>
          {/* The Fish being held */}
          <div 
            className="text-6xl absolute top-1/2 transition-transform hover:scale-110" 
            style={{ 
              transform: `scale(${fishScale}) translateY(-20px)`,
              filter: `drop-shadow(0 0 10px ${fish.color})`
            }}
          >
            {fish.icon}
          </div>
        </div>

        <div className="w-full bg-black/40 rounded-2xl p-4 space-y-2 border border-white/10">
          <div className={`text-2xl font-black text-center ${getRarityClass()}`}>
            {fish.rarity} {fish.name}
          </div>
          {fish.isSuperSize && (
            <div className="text-center bg-yellow-500 text-black text-xs font-bold py-1 px-3 rounded-full uppercase tracking-tighter w-fit mx-auto">
              ✨ Super Sized! (+20% Gold) ✨
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
              <span className="text-sky-300 text-[10px] uppercase font-bold">Weight</span>
              <span className="text-lg font-mono">{fish.weight}g</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
              <span className="text-sky-300 text-[10px] uppercase font-bold">Length</span>
              <span className="text-lg font-mono">{fish.length}cm</span>
            </div>
          </div>
          <div className="pt-4 flex justify-center items-center space-x-2 text-2xl font-bold text-yellow-400">
            <span>🪙</span>
            <span>{fish.value}</span>
          </div>
        </div>

        <button 
          onClick={onCollect}
          className="mt-8 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Add to Backpack
        </button>
      </div>
    </div>
  );
};

export default CatchResult;
