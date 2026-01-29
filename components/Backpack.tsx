
import React from 'react';
import { CaughtFish, Rarity } from '../types';

interface BackpackProps {
  items: CaughtFish[];
  onClose: () => void;
  onSell: (id: string) => void;
  onSellAll: () => void;
}

const Backpack: React.FC<BackpackProps> = ({ items, onClose, onSell, onSellAll }) => {
  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.RARE: return 'border-blue-500 bg-blue-500/10';
      case Rarity.EPIC: return 'border-purple-500 bg-purple-500/10';
      case Rarity.LEGENDARY: return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-600 bg-white/5';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md h-[80vh] bg-slate-900 rounded-3xl border-2 border-white/20 flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="mr-2">🎒</span> My Catch ({items.length}/10)
          </h2>
          <button onClick={onClose} className="text-3xl text-gray-400">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <span className="text-6xl mb-4">🏜️</span>
              <p>Your backpack is empty.</p>
              <p className="text-sm">Go fishing to fill it up!</p>
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item.id} 
                className={`p-3 rounded-xl border flex items-center space-x-4 ${getRarityColor(item.rarity)}`}
              >
                <div className="text-3xl" style={{ filter: `drop-shadow(0 0 5px ${item.color})` }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs opacity-70">
                    {item.length}cm • {item.weight}g
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-yellow-400 font-bold">🪙 {item.value}</div>
                  <button 
                    onClick={() => onSell(item.id)}
                    className="mt-1 px-3 py-1 bg-white/10 rounded-md text-[10px] uppercase font-bold hover:bg-white/20"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10">
            <button 
              onClick={onSellAll}
              className="w-full py-3 bg-yellow-600 text-white rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center space-x-2"
            >
              <span>💰 Sell All Fish</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-sm">
                {items.reduce((sum, i) => sum + i.value, 0)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backpack;
