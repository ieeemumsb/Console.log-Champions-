export interface Player {
  name: string;
  health: number;
  gold: number;
  xp: number;
  power: number;
  level: number;
  maxHealth: number;
}

export interface Monster {
  name: string;
  image: string;
  power: number;
  health: number;
  maxHealth: number;
  description: string;
}

export interface LeaderboardPlayer {
  name: string;
  level: number;
  xp: number;
  gold: number;
  rank: number;
}

export type GameState = 'menu' | 'playing' | 'victory' | 'gameOver';
export type BattleState = 'menu' | 'map' | 'battling';
