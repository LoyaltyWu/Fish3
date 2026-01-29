
import React from 'react';
import { GameState, Rod } from '../types';

interface FishingAreaProps {
  gameState: GameState;
  castDistance: number;
  onStartCast: () => void;
  onReleaseCast: () => void;
  onStrike: () => void;
  activeRod: Rod;
}

const getRodIcon = (id: number) => {
  switch (id) {
    case 0: return '🪵'; // Bamboo
    case 1: return '💠'; // Glass Fiber
    case 2: return '🧬'; // Carbon Fiber
    case 3: return '🌌'; // Iridium
    default: return '🎣';
  }
};

const FishingArea: React.FC<FishingAreaProps> = ({ 
  gameState, 
  castDistance, 
  onStartCast, 
  onReleaseCast, 
  onStrike,
  activeRod
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Background Water Elements */}
      <div className="absolute bottom-1/4 w-full flex justify-center">
        <div className="relative">
          <div className="ripple" style={{ width: '100px', height: '100px' }}></div>
          <div className="ripple" style={{ width: '150px', height: '150px', animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="mt-auto mb-20 flex flex-col items-center space-y-12">
        {gameState === 'IDLE' && (
          <button 
            onTouchStart={onStartCast}
            onMouseDown={onStartCast}
            className="w-32 h-32 bg-sky-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-5xl active:scale-90 transition-transform relative"
          >
             <span className="absolute -top-2 -right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md border-2 border-sky-400">
               {getRodIcon(activeRod.id)}
             </span>
             🎣
          </button>
        )}

        {gameState === 'CASTING' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-64 h-6 bg-black/40 rounded-full overflow-hidden border-2 border-white p-1">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full transition-all duration-100 animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
            <button 
              onTouchEnd={onReleaseCast}
              onMouseUp={onReleaseCast}
              className="w-32 h-32 bg-orange-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl"
            >
              Release!
            </button>
          </div>
        )}

        {gameState === 'WAITING' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-xl font-bold animate-pulse text-sky-200 flex items-center space-x-2">
              <span>Wait...</span>
              <span className="text-2xl">{getRodIcon(activeRod.id)}</span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full animate-ping"></div>
          </div>
        )}

        {gameState === 'HOOKED' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-3xl font-black text-yellow-400 animate-bounce">BITING!</div>
            <button 
              onClick={onStrike}
              className="w-32 h-32 bg-red-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl animate-pulse"
            >
              STRIKE!
            </button>
          </div>
        )}
      </div>

      {/* Visual Indicator of the rod */}
      <div className="absolute bottom-10 left-10 flex items-center space-x-2 text-sky-200/50 font-mono text-sm bg-black/20 p-2 rounded-lg">
        <span className="text-lg">{getRodIcon(activeRod.id)}</span>
        <span>{activeRod.name}</span>
      </div>
    </div>
  );
};

export default FishingArea;
