
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FishDefinition, Rod, Rarity } from '../types';
import { soundManager } from '../services/soundManager';

interface FishingMinigameProps {
  fishDef: FishDefinition;
  rod: Rod;
  onComplete: (success: boolean) => void;
}

const FishingMinigame: React.FC<FishingMinigameProps> = ({ fishDef, rod, onComplete }) => {
  const containerHeight = 350; 
  const greenBarHeight = rod.barSize;
  const fishIndicatorSize = 30;

  // Positions (0 to containerHeight - size)
  const [barPos, setBarPos] = useState(containerHeight - greenBarHeight);
  const [fishPos, setFishPos] = useState(containerHeight / 2);
  const [progress, setProgress] = useState(30); // Start with some progress buffer
  const [isReeling, setIsReeling] = useState(false);
  const [timeLeftAtZero, setTimeLeftAtZero] = useState(15.0);

  // Physics refs
  const barVel = useRef(0);
  const fishTarget = useRef(containerHeight / 2);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>(0);
  const hasFinished = useRef(false);
  
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
      case Rarity.COMMON: return { speedBonus: 1.8, lossRate: 0.5 };
      case Rarity.RARE: return { speedBonus: 1.3, lossRate: 0.8 };
      case Rarity.EPIC: return { speedBonus: 1.0, lossRate: 1.2 };
      case Rarity.LEGENDARY: return { speedBonus: 0.7, lossRate: 1.5 };
      default: return { speedBonus: 1.0, lossRate: 1.0 };
    }
  };

  const update = useCallback((time: number) => {
    if (hasFinished.current) return;

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
      const moveSpeed = 4 + (fishDef.maxWeight / 5000) + (fishDef.rarity === Rarity.LEGENDARY ? 5 : 0);
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
          const successTime = (fishDef.maxWeight / 5000) + (fishDef.maxLength / 100);
          const clampedTime = Math.max(3, Math.min(8, successTime));
          
          let increment = (100 / (clampedTime * 60)) * speedBonus;
          let next = isMatching ? prev + increment : prev - (increment * lossRate);
          
          const clampedNext = Math.max(0, Math.min(100, next));
          
          if (clampedNext <= 0) {
            zeroProgressCounter.current += 1;
            const remaining = Math.max(0, 15 - (zeroProgressCounter.current / 60));
            setTimeLeftAtZero(remaining);

            // Trigger failure directly in the loop if the counter exceeds the grace period
            if (zeroProgressCounter.current >= failGrace && !hasFinished.current) {
                hasFinished.current = true;
                onComplete(false);
            }
          } else {
            zeroProgressCounter.current = 0;
            if (timeLeftAtZero !== 15.0) setTimeLeftAtZero(15.0);
          }

          if (clampedNext >= 100 && !hasFinished.current) {
            hasFinished.current = true;
            onComplete(true);
          }
          
          return clampedNext;
        });

        return currentFishPos;
      });
      return currentBarPos;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [fishDef, rod, greenBarHeight, containerHeight, isReeling, onComplete]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

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
      <div className="flex flex-col items-center space-y-6">
        {/* Status Header */}
        <div className="text-center h-10">
            {zeroProgressCounter.current > 0 ? (
                <div className="bg-red-600 px-4 py-1 rounded-full animate-pulse border-2 border-white shadow-lg">
                   <span className="text-white font-black tracking-tighter uppercase">Escape Countdown: {timeLeftAtZero.toFixed(1)}s</span>
                </div>
            ) : (
                <div className="text-white font-bold text-lg drop-shadow-md">
                   {fishDef.rarity === Rarity.LEGENDARY ? '🚨 LEGENDARY FISH! 🚨' : 'REELING IN...'}
                </div>
            )}
        </div>

        <div className="flex items-center space-x-12">
            <div 
            className="relative w-24 bg-black/80 rounded-xl border-4 border-gray-600 flex flex-col items-center overflow-visible"
            style={{ height: containerHeight + 8 }}
            >
            {/* Escape Warning Overlay */}
            {zeroProgressCounter.current > 0 && (
                <div 
                className="absolute inset-0 bg-red-900/60 pointer-events-none rounded-lg transition-opacity duration-300"
                style={{ opacity: dangerPercent }}
                ></div>
            )}

            {/* Progress Bar (Side) */}
            <div className="absolute -right-12 bottom-0 w-4 bg-gray-800 rounded-full h-full overflow-hidden border-2 border-gray-600">
                <div 
                className={`absolute bottom-0 w-full transition-all duration-100 ${progress < 25 ? 'bg-red-500 animate-pulse' : 'bg-green-400 shadow-[0_0_10px_#4ade80]'}`}
                style={{ height: `${progress}%` }}
                ></div>
            </div>

            {/* Green Bar (Catcher) */}
            <div 
                className="absolute w-16 left-1 rounded-md fishing-green-bar transition-colors duration-200"
                style={{ height: greenBarHeight, top: barPos, boxShadow: isReeling ? '0 0 15px #4ade80' : 'none' }}
            ></div>

            {/* Fish Indicator */}
            <div 
                className="absolute w-12 h-12 flex items-center justify-center fish-indicator"
                style={{ top: fishPos, left: '50%', transform: 'translateX(-50%)' }}
            >
                <span className="text-4xl" style={{ filter: `drop-shadow(0 0 10px ${fishDef.color})` }}>
                {fishDef.icon}
                </span>
            </div>
            </div>

            {/* Dedicated Reel Button Area */}
            <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
                <div className={`absolute -inset-4 rounded-full border-4 border-orange-500/30 transition-transform duration-200 ${isReeling ? 'scale-110 opacity-100 animate-ping' : 'scale-100 opacity-0'}`}></div>
                
                <button
                    onMouseDown={startReeling}
                    onMouseUp={stopReeling}
                    onMouseLeave={stopReeling}
                    onTouchStart={startReeling}
                    onTouchEnd={stopReeling}
                    className={`relative w-40 h-40 rounded-full border-8 transition-all flex flex-col items-center justify-center shadow-2xl active:scale-95 ${
                    isReeling 
                        ? 'bg-orange-500 border-orange-300 scale-105 shadow-orange-500/50' 
                        : 'bg-slate-700 border-slate-500 shadow-black'
                    }`}
                >
                    <span className={`text-6xl mb-1 transition-transform duration-75 ${isReeling ? 'rotate-45' : 'rotate-0'}`}>⚙️</span>
                    <span className="text-sm font-black uppercase tracking-widest text-white drop-shadow-md">REEL</span>
                </button>
            </div>
            
            <div className="flex flex-col items-center space-y-1">
                <div className="text-[10px] text-white/70 uppercase font-black tracking-widest bg-black/40 px-3 py-1 rounded-full">Hold Button</div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FishingMinigame;
