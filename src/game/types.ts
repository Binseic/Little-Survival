export type MonsterType = 'bat' | 'zombie' | 'skeleton' | 'ghost' | 'demon' | 'boss' | 'reaper';

export interface RunStatistics {
  totalExpEarned: number;
  currentExp: number;
  nextExp: number;
  totalDamageTaken: number;
  totalDamageDealt: number;
  survivalTime: number;
  kills: number;
  finalLevel: number;
  deathCause: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  nextExp: number;
  kills: number;
  magnetRadius: number;
  facing: number; // 1 = right, -1 = left
  isMoving: boolean;
  walkCycle: number;
  invulnerableTimer: number;
  // Stats multipliers
  might: number; // damage multiplier
  cooldownReduction: number; // cooldown mult (e.g. 0.85 = 15% faster)
  critChance: number; // 0 to 1
  critDamage: number; // 1.5 to 3.0
  // Weapons state
  weapons: {
    magicMissile: {
      level: number;
      damage: number;
      cooldown: number;
      timer: number;
      count: number;
      pierce: number;
      speed: number;
    };
    spinningAura: {
      level: number;
      damage: number;
      count: number;
      orbitRadius: number;
      angle: number;
      speed: number;
      orbRadius: number;
    };
    lightning: {
      level: number;
      damage: number;
      cooldown: number;
      timer: number;
      count: number;
    };
    fireball: {
      level: number;
      damage: number;
      cooldown: number;
      timer: number;
      radius: number;
    };
  };
}

export interface Enemy {
  id: number;
  type: MonsterType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  expValue: number;
  color: string;
  flashTimer: number;
  animTimer: number;
  isBoss?: boolean;
  isInvincible?: boolean;
}

export type GemType = 'gem_blue' | 'gem_green' | 'gem_red' | 'magnet' | 'potion' | 'bomb';

export interface DropItem {
  id: number;
  type: GemType;
  x: number;
  y: number;
  value: number;
  radius: number;
  color: string;
  isAttracted: boolean;
  vx: number;
  vy: number;
  sparkleTimer: number;
}

export interface Projectile {
  id: number;
  type: 'magic_missile' | 'fireball' | 'enemy_bullet';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  pierce: number;
  life: number;
  maxLife: number;
  color: string;
  glowColor: string;
  blastRadius?: number;
}

export interface LightningEffect {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  life: number;
  maxLife: number;
  segments: { x: number; y: number }[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
}

export interface DamageNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  isCritical: boolean;
}

export interface UpgradeOption {
  id: string;
  title: string;
  koreanTitle: string;
  desc: string;
  icon: string;
  level: number;
  maxLevel: number;
  type: 'weapon' | 'passive';
  rarity: 'common' | 'rare' | 'epic';
}
