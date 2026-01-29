
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FishDefinition, Rod, Rarity } from '../types';
import { soundManager } from '../services/soundManager';

interface FishingMinigameProps {
  fishDef: FishDefinition;
  rod: Rod;
  onComplete: (success: boolean) => void;
}

const FishingMinigame: React.FC<FishingMinigameProps> = ({ fishDef, rod, onComplete }) => {
  const containerHeight = 350; // Slightly smaller to accommodate the button
  const greenBarHeight = rod.barSize;
  const fishIndicatorSize = 30;

  // Positions (0 to containerHeight - size)
  const [barPos, setBarPos] = useState(containerHeight - greenBarHeight);
  const [fishPos, setFishPos] = useState(containerHeight / 2);
  const [progress, setProgress] = useState(15);
  const [isReeling, setIsReeling] = useState(false);

  // Physics refs
  const barVel = useRef(0);
  const fishTarget = useRef(containerHeight / 2);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>();
  
  // Failure tracking - Fixed 15 seconds (900 frames at 60fps)
  const failGrace = 900;
  const zeroProgressCounter = useRef(0);

  const gravity = 0.35;
  const lift = -0.75;

  // Sound loop for reeling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isReeling) {
      interval = setInterval(() => {
        soundManager.playReel();
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isReeling]);

  // Difficulty scaling based on rarity
  const getRarityMultipliers = () => {
    switch (fishDef.rarity) {
      case Rarity.COMMON: return { speedBonus: 1.8, lossRate: 0.2 };
      case Rarity.RARE: return { speedBonus: 1.3, lossRate: 0.4 };
      case Rarity.EPIC: return { speedBonus: 1.0, lossRate: 0.7 };
      case Rarity.LEGENDARY: return { speedBonus: 0.7, lossRate: 1.2 };
      default: return { speedBonus: 1.0, lossRate: 0.5 };
    }
  };

  const update = useCallback((time: number) => {
    const dt = (time - lastTime.current) / 16.6;
    lastTime.current = time;

    const { speedBonus, lossRate } = getRarityMultipliers();

    // 1. Update Green Bar Position
    if (isReeling) {
      barVel.current += lift * dt;
    } else {
      barVel.current += gravity * dt;
    }

    setBarPos(prev => {
      let next = prev + barVel.current * dt;
      if (next < 0) {
        next = 0;
        barVel.current = 0;
      }
      if (next > containerHeight - greenBarHeight) {
        next = containerHeight - greenBarHeight;
        barVel.current = 0;
      }
      return next;
    });

    // 2. Update Fish Position (AI)
    if (Math.random() < 0.02) {
      fishTarget.current = Math.random() * (containerHeight - fishIndicatorSize);
    }
    
    setFishPos(prev => {
      const diff = fishTarget.current - prev;
      const moveSpeed = 3 + (fishDef.maxWeight / 25);
      let next = prev + (diff * 0.1 * moveSpeed / 10) * dt;
      return next;
    });

    // 3. Progress Tracking
    setBarPos(currentBarPos => {
      setFishPos(currentFishPos => {
        const barTop = currentBarPos;
        const barBottom = currentBarPos + greenBarHeight;
        const fishCenter = currentFishPos + fishIndicatorSize / 2;

        const isMatching = fishCenter >= barTop - rod.tolerance && fishCenter <= barBottom + rod.tolerance;
        
        setProgress(prev => {
          const successTime = (fishDef.maxWeight + fishDef.maxLength) / 50;
          const clampedTime = Math.max(2, Math.min(6, successTime));
          
          let increment = (100 / (clampedTime * 60)) * speedBonus;
          let next = isMatching ? prev + increment : prev - increment * lossRate;
          
          const clampedNext = Math.max(0, Math.min(100, next));
          
          if (clampedNext <= 0) {
            zeroProgressCounter.current += 1;
          } else {
            zeroProgressCounter.current = 0;
          }
          
          return clampedNext;
        });

        return currentFishPos;
      });
      return currentBarPos;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [fishDef, rod, greenBarHeight, containerHeight, isReeling]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  useEffect(() => {
    if (progress >= 100) {
      onComplete(true);
    }
    
    if (progress <= 0 && zeroProgressCounter.current > failGrace) {
      onComplete(false);
    }
  }, [progress, onComplete]);

  const dangerPercent = Math.min(1, zeroProgressCounter.current / failGrace);

  const startReeling = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsReeling(true);
  };

  const stopReeling = () => {
    setIsReeling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-8">
        <div 
          className="relative w-24 bg-black/80 rounded-xl border-4 border-gray-600 flex flex-col items-center"
          style={{ height: containerHeight + 8 }}
        >
          {/* Escape Warning Overlay */}
          {zeroProgressCounter.current > 0 && (
            <div 
              className="absolute inset-0 bg-red-900/40 pointer-events-none rounded-lg transition-opacity duration-300"
              style={{ opacity: dangerPercent }}
            ></div>
          )}

          {/* Progress Bar (Side) */}
          <div className="absolute -right-12 bottom-0 w-4 bg-gray-800 rounded-full h-full overflow-hidden border-2 border-gray-600">
            <div 
              className={`absolute bottom-0 w-full transition-all duration-100 ${progress < 20 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}
              style={{ height: `${progress}%` }}
            ></div>
          </div>

          {/* Green Bar (Catcher) */}
          <div 
            className="absolute w-16 left-1 rounded-md fishing-green-bar"
            style={{ height: greenBarHeight, top: barPos }}
          ></div>

          {/* Fish Indicator */}
          <div 
            className="absolute w-12 h-12 flex items-center justify-center fish-indicator"
            style={{ top: fishPos, left: '50%', transform: 'translateX(-50%)' }}
          >
            <span className="text-3xl" style={{ filter: `drop-shadow(0 0 10px ${fishDef.color})` }}>
              {fishDef.icon}
            </span>
          </div>

          <div className="absolute -top-10 text-white font-bold whitespace-nowrap text-sm">
            {zeroProgressCounter.current > (failGrace * 0.7) ? '⚠️ 15s WARNING! ⚠️' : (fishDef.rarity === Rarity.LEGENDARY ? '🚨 LEGENDARY! 🚨' : 'Hold Reel!')}
          </div>
        </div>

        {/* Dedicated Reel Button */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onMouseDown={startReeling}
            onMouseUp={stopReeling}
            onMouseLeave={stopReeling}
            onTouchStart={startReeling}
            onTouchEnd={stopReeling}
            className={`w-32 h-32 rounded-full border-8 transition-all flex flex-col items-center justify-center shadow-2xl active:scale-95 ${
              isReeling 
                ? 'bg-orange-500 border-orange-300 scale-105' 
                : 'bg-slate-700 border-slate-500'
            }`}
          >
            <span className="text-4xl mb-1">⚙️</span>
            <span className="text-xs font-black uppercase tracking-tighter">Reel In</span>
          </button>
          <div className="text-[10px] text-white/50 uppercase font-bold">Press & Hold</div>
        </div>
      </div>
    </div>
  );
};

export default FishingMinigame;
