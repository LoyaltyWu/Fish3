
export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface FishDefinition {
  id: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  minLength: number;
  maxLength: number;
  rarity: Rarity;
  probability: number;
  color: string;
  icon: string;
}

export interface CaughtFish {
  id: string;
  defId: string;
  name: string;
  weight: number;
  length: number;
  rarity: Rarity;
  value: number;
  isSuperSize: boolean;
  color: string;
  icon: string;
}

export interface Rod {
  id: number;
  name: string;
  cost: number;
  barSize: number;
  tolerance: number;
  rarityBonus: number;
  lengthBonus: number;
  color: string;
  description: string;
}

export type GameState = 'IDLE' | 'CASTING' | 'WAITING' | 'HOOKED' | 'MINIGAME' | 'RESULT';
