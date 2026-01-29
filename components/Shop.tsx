
import React from 'react';
import { Rod } from '../types';

interface ShopProps {
  rods: Rod[];
  ownedIds: number[];
  activeId: number;
  coins: number;
  onBuy: (id: number) => void;
  onClose: () => void;
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

const Shop: React.FC<ShopProps> = ({ rods, ownedIds, activeId, coins, onBuy, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border-2 border-white/20 flex flex-col shadow-2xl animate-in slide-in-from-top-10 max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="mr-2">🏪</span> Rod Shop
          </h2>
          <button onClick={onClose} className="text-3xl text-gray-400">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rods.map(rod => {
            const isOwned = ownedIds.includes(rod.id);
            const isActive = activeId === rod.id;
            const canAfford = coins >= rod.cost;

            return (
              <div 
                key={rod.id} 
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isActive ? 'border-sky-400 bg-sky-900/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : isOwned ? 'border-green-600/50 bg-green-900/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 text-2xl ${isActive ? 'animate-pulse' : ''}`} 
                      style={{ borderColor: rod.color, backgroundColor: `${rod.color}33` }}
                    >
                      {getRodIcon(rod.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{rod.name}</h3>
                      <p className="text-xs text-gray-400">{rod.description}</p>
                    </div>
                  </div>
                  {!isOwned && (
                    <div className="flex flex-col items-end">
                      <div className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>🪙 {rod.cost}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-gray-400 mt-3 bg-black/20 p-2 rounded-lg">
                  <div className="flex justify-between">
                    <span>Bar Size:</span>
                    <span className="text-white">{rod.barSize}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety:</span>
                    <span className="text-white">±{rod.tolerance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rare Prob:</span>
                    <span className="text-sky-400">+{Math.round(rod.rarityBonus * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size Max:</span>
                    <span className="text-sky-400">+{Math.round(rod.lengthBonus * 100)}%</span>
                  </div>
                </div>

                <button 
                  disabled={!isOwned && !canAfford}
                  onClick={() => onBuy(rod.id)}
                  className={`mt-4 w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${
                    isActive 
                      ? 'bg-sky-500 text-white cursor-default' 
                      : isOwned 
                        ? 'bg-green-600 text-white hover:bg-green-500' 
                        : canAfford 
                          ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isActive ? 'Current Rod' : isOwned ? 'Switch Rod' : 'Buy Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Fixed: Add missing default export
export default Shop;
