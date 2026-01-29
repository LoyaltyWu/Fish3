
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, 
  CaughtFish, 
  Rod, 
  Rarity, 
  FishDefinition 
} from './types';
import { 
  FISH_DATA, 
  RODS, 
  RARITY_MULTIPLIERS, 
  MAX_INVENTORY 
} from './constants';
import { soundManager } from './services/soundManager';

// Subcomponents
import Header from './components/Header';
import FishingArea from './components/FishingArea';
import FishingMinigame from './components/FishingMinigame';
import CatchResult from './components/CatchResult';
import Backpack from './components/Backpack';
import Shop from './components/Shop';

const App: React.FC = () => {
  // Persistence states
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('fish_coins');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [inventory, setInventory] = useState<CaughtFish[]>(() => {
    const saved = localStorage.getItem('fish_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [ownedRodIds, setOwnedRodIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('fish_rods');
    return saved ? JSON.parse(saved) : [0];
  });
  const [activeRodId, setActiveRodId] = useState<number>(() => {
    const saved = localStorage.getItem('fish_active_rod');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Game flow states
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [castDistance, setCastDistance] = useState(0); // 0 to 1
  const [activeFish, setActiveFish] = useState<FishDefinition | null>(null);
  const [caughtFish, setCaughtFish] = useState<CaughtFish | null>(null);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Refs for logic
  const castStartTime = useRef<number | null>(null);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hookTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRod = RODS.find(r => r.id === activeRodId) || RODS[0];

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('fish_coins', coins.toString());
    localStorage.setItem('fish_inventory', JSON.stringify(inventory));
    localStorage.setItem('fish_rods', JSON.stringify(ownedRodIds));
    localStorage.setItem('fish_active_rod', activeRodId.toString());
  }, [coins, inventory, ownedRodIds, activeRodId]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [...prev, msg]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const startCasting = () => {
    if (gameState !== 'IDLE') return;
    if (inventory.length >= MAX_INVENTORY) {
      addNotification('Backpack is full!');
      return;
    }
    setGameState('CASTING');
    castStartTime.current = Date.now();
    soundManager.playCast();
  };

  const releaseCast = () => {
    if (gameState !== 'CASTING' || !castStartTime.current) return;
    const duration = Math.min(2000, Date.now() - castStartTime.current);
    const distance = duration / 2000;
    setCastDistance(distance);
    setGameState('WAITING');
    
    // Determine wait time (2-5s)
    const wait = 2000 + Math.random() * 3000;
    waitTimer.current = setTimeout(() => {
      triggerHook();
    }, wait);
  };

  const triggerHook = () => {
    setGameState('HOOKED');
    soundManager.playHook();
    
    // Hook window: 3s
    hookTimer.current = setTimeout(() => {
      if (gameState === 'HOOKED') {
        setGameState('IDLE');
        addNotification('Fish got away!');
      }
    }, 3000);
  };

  const strike = () => {
    if (gameState !== 'HOOKED') return;
    if (hookTimer.current) clearTimeout(hookTimer.current);

    // Determine fish based on distance and rod
    const rarityPool = FISH_DATA.map(f => {
      let prob = f.probability;
      if (f.rarity !== Rarity.COMMON) {
        prob += activeRod.rarityBonus * (castDistance > 0.7 ? 1.5 : 1);
      }
      return { ...f, prob };
    });

    const totalProb = rarityPool.reduce((acc, curr) => acc + curr.prob, 0);
    let rand = Math.random() * totalProb;
    let selectedFish = rarityPool[0];
    for (const f of rarityPool) {
      if (rand < f.prob) {
        selectedFish = f;
        break;
      }
      rand -= f.prob;
    }

    setActiveFish(selectedFish);
    setGameState('MINIGAME');
  };

  const onMinigameResult = (success: boolean) => {
    if (success && activeFish) {
      generateCaughtFish(activeFish);
      setGameState('RESULT');
      soundManager.playSuccess();
    } else {
      setGameState('IDLE');
      addNotification('Fish escaped!');
    }
    setActiveFish(null);
  };

  const generateCaughtFish = (def: FishDefinition) => {
    const lengthBase = def.minLength + Math.random() * (def.maxLength - def.minLength);
    const lengthBoost = lengthBase * activeRod.lengthBonus * castDistance;
    const length = Number((lengthBase + lengthBoost).toFixed(1));
    const weight = Math.floor(def.minWeight + Math.random() * (def.maxWeight - def.minWeight));
    
    const isSuperSize = length >= def.maxLength * 0.9;
    const multiplier = RARITY_MULTIPLIERS[def.rarity];
    
    // Updated Gold Formula: (weight/100 * 0.8 + length * 0.5)
    // Scale weight by dividing by 100 to balance with 1/10 rod prices
    let value = Math.floor(((weight / 100) * 0.8 + length * 0.5) * multiplier);
    if (isSuperSize) value = Math.floor(value * 1.2);

    const fish: CaughtFish = {
      id: Math.random().toString(36).substr(2, 9),
      defId: def.id,
      name: def.name,
      weight,
      length,
      rarity: def.rarity,
      value,
      isSuperSize,
      color: def.color,
      icon: def.icon
    };
    setCaughtFish(fish);
  };

  const collectFish = () => {
    if (caughtFish) {
      if (inventory.length < MAX_INVENTORY) {
        setInventory([...inventory, caughtFish]);
        addNotification(`Caught ${caughtFish.name}!`);
      } else {
        addNotification('Backpack full! Fish released.');
      }
      setCaughtFish(null);
      setGameState('IDLE');
    }
  };

  const sellFish = (fishId: string) => {
    const fish = inventory.find(f => f.id === fishId);
    if (fish) {
      setCoins(c => c + fish.value);
      setInventory(inv => inv.filter(f => f.id !== fishId));
      soundManager.playCoin();
    }
  };

  const sellAll = () => {
    const totalValue = inventory.reduce((sum, f) => sum + f.value, 0);
    setCoins(c => c + totalValue);
    setInventory([]);
    if (totalValue > 0) {
      soundManager.playCoin();
      addNotification(`Sold all for ${totalValue} coins!`);
    }
  };

  const buyRod = (rodId: number) => {
    const rod = RODS.find(r => r.id === rodId);
    if (rod && coins >= rod.cost && !ownedRodIds.includes(rodId)) {
      setCoins(c => c - rod.cost);
      setOwnedRodIds([...ownedRodIds, rodId]);
      setActiveRodId(rodId);
      soundManager.playUnlock();
      addNotification(`Unlocked ${rod.name}!`);
    } else if (ownedRodIds.includes(rodId)) {
      setActiveRodId(rodId);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-900 font-sans text-white select-none">
      <Header 
        coins={coins} 
        onOpenBackpack={() => setShowBackpack(true)} 
        onOpenShop={() => setShowShop(true)}
        inventoryCount={inventory.length}
      />

      <main className="w-full h-full flex flex-col items-center justify-center pt-20">
        <FishingArea 
          gameState={gameState} 
          castDistance={castDistance}
          onStartCast={startCasting}
          onReleaseCast={releaseCast}
          onStrike={strike}
          activeRod={activeRod}
        />

        {gameState === 'MINIGAME' && activeFish && (
          <FishingMinigame 
            fishDef={activeFish} 
            rod={activeRod} 
            onComplete={onMinigameResult} 
          />
        )}

        {gameState === 'RESULT' && caughtFish && (
          <CatchResult 
            fish={caughtFish} 
            onCollect={collectFish} 
          />
        )}
      </main>

      {/* Overlays */}
      {showBackpack && (
        <Backpack 
          items={inventory} 
          onClose={() => setShowBackpack(false)} 
          onSell={sellFish}
          onSellAll={sellAll}
        />
      )}

      {showShop && (
        <Shop 
          rods={RODS}
          ownedIds={ownedRodIds}
          activeId={activeRodId}
          coins={coins}
          onBuy={buyRod}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center space-y-2 z-50">
        {notifications.map((note, i) => (
          <div key={i} className="bg-black/70 px-4 py-2 rounded-full text-sm animate-bounce">
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
