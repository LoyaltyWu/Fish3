
import { Rarity, FishDefinition, Rod } from './types';

export const FISH_DATA: FishDefinition[] = [
  { id: '1', name: 'Crucian Carp', minWeight: 150, maxWeight: 1500, minLength: 15, maxLength: 40, rarity: Rarity.COMMON, probability: 0.35, color: '#94a3b8', icon: '🐟' },
  { id: '2', name: 'Sunfish', minWeight: 100, maxWeight: 600, minLength: 10, maxLength: 25, rarity: Rarity.COMMON, probability: 0.30, color: '#fcd34d', icon: '🐠' },
  { id: '3', name: 'Catfish', minWeight: 1000, maxWeight: 10000, minLength: 40, maxLength: 100, rarity: Rarity.RARE, probability: 0.15, color: '#475569', icon: '🐡' },
  { id: '4', name: 'Salmon', minWeight: 2000, maxWeight: 12000, minLength: 50, maxLength: 110, rarity: Rarity.RARE, probability: 0.10, color: '#f87171', icon: '🐟' },
  { id: '5', name: 'Sturgeon', minWeight: 10000, maxWeight: 60000, minLength: 80, maxLength: 200, rarity: Rarity.EPIC, probability: 0.05, color: '#6366f1', icon: '🦈' },
  { id: '6', name: 'Ghost Shark', minWeight: 3000, maxWeight: 15000, minLength: 60, maxLength: 150, rarity: Rarity.EPIC, probability: 0.04, color: '#a78bfa', icon: '🦑' },
  { id: '7', name: 'Golden Koi', minWeight: 2000, maxWeight: 15000, minLength: 30, maxLength: 90, rarity: Rarity.LEGENDARY, probability: 0.008, color: '#fbbf24', icon: '✨' },
  { id: '8', name: 'Deep Sea Dragon', minWeight: 50000, maxWeight: 300000, minLength: 200, maxLength: 800, rarity: Rarity.LEGENDARY, probability: 0.002, color: '#f59e0b', icon: '🐉' },
];

export const RODS: Rod[] = [
  { id: 0, name: 'Bamboo Pole', cost: 0, barSize: 80, tolerance: 10, rarityBonus: 0, lengthBonus: 0, color: '#854d0e', description: 'Simple and reliable.' },
  { id: 1, name: 'Glass Fiber Rod', cost: 180, barSize: 100, tolerance: 15, rarityBonus: 0.1, lengthBonus: 0.1, color: '#3b82f6', description: 'Light and flexible.' },
  { id: 2, name: 'Carbon Fiber Rod', cost: 450, barSize: 130, tolerance: 22, rarityBonus: 0.25, lengthBonus: 0.2, color: '#1e293b', description: 'Strong and modern.' },
  { id: 3, name: 'Iridium Rod', cost: 900, barSize: 170, tolerance: 30, rarityBonus: 0.4, lengthBonus: 0.3, color: '#a855f7', description: 'The peak of fishing technology.' }
];

export const RARITY_MULTIPLIERS = {
  [Rarity.COMMON]: 1,
  [Rarity.RARE]: 2,
  [Rarity.EPIC]: 3,
  [Rarity.LEGENDARY]: 5,
};

export const MAX_INVENTORY = 10;
