
import React from 'react';

interface HeaderProps {
  coins: number;
  inventoryCount: number;
  onOpenBackpack: () => void;
  onOpenShop: () => void;
}

const Header: React.FC<HeaderProps> = ({ coins, inventoryCount, onOpenBackpack, onOpenShop }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-b from-sky-800 to-transparent flex items-center justify-between px-6 z-40">
      <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-yellow-500/50">
        <span className="text-yellow-400 text-2xl font-bold">🪙</span>
        <span className="text-xl font-mono">{coins.toLocaleString()}</span>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={onOpenShop}
          className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg shadow-lg border-2 border-blue-400 active:scale-95 transition-transform"
        >
          🛒
        </button>
        <button 
          onClick={onOpenBackpack}
          className="relative w-12 h-12 flex items-center justify-center bg-green-600 rounded-lg shadow-lg border-2 border-green-400 active:scale-95 transition-transform"
        >
          🎒
          {inventoryCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-white font-bold">
              {inventoryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
