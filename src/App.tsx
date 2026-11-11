/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Play,
  Pause,
  Trophy,
  Skull,
  Heart,
  Code,
  Zap,
  Sparkles,
  Move,
  Shield,
  X,
  Flame,
  Swords,
  Activity,
  AlertTriangle,
  Award,
  FastForward
} from 'lucide-react';
import { sound } from './game/audio';
import {
  Player,
  Enemy,
  DropItem,
  Projectile,
  Particle,
  DamageNumber,
  LightningEffect,
  UpgradeOption,
  MonsterType,
  RunStatistics
} from './game/types';
import { getStandaloneHtml } from './game/standaloneHtml';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React state for HUD, Modals, and Final Stats
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [nextExp, setNextExp] = useState(20);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [kills, setKills] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmActive, setBgmActive] = useState(false);
  const [finalStats, setFinalStats] = useState<RunStatistics | null>(null);

  const [bestTime, setBestTime] = useState<number>(() => {
    return Number(localStorage.getItem('vs_best_time') || 0);
  });
  const [bestKills, setBestKills] = useState<number>(() => {
    return Number(localStorage.getItem('vs_best_kills') || 0);
  });

  // Level up modal choices
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeOption[]>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Standalone HTML Modal & Notification
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Alerts
  const [bossAlert, setBossAlert] = useState(false);
  const [reaperAlert, setReaperAlert] = useState(false);

  // Touch Virtual Joystick
  const [touchActive, setTouchActive] = useState(false);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDirRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickKnobRef = useRef<HTMLDivElement | null>(null);

  // Game internal mutable state stored in refs to avoid re-renders on 60fps loop
  const gameStateRef = useRef<{
    player: Player;
    enemies: Enemy[];
    dropItems: DropItem[];
    projectiles: Projectile[];
    particles: Particle[];
    damageNumbers: DamageNumber[];
    lightningEffects: LightningEffect[];
    keys: Record<string, boolean>;
    nextEnemyId: number;
    nextItemId: number;
    nextDamageId: number;
    spawnTimer: number;
    lastBossTime: number;
    gameTime: number;
    isOver: boolean;
    isLevelUpPause: boolean;
    isGamePaused: boolean;
    lastFrameTime: number;
    screenShake: number;
    reaperSpawned: boolean;
    totalExpEarned: number;
    totalDamageTaken: number;
    totalDamageDealt: number;
    deathCause: string;
  }>({
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 18,
      speed: 3.3,
      hp: 100,
      maxHp: 100,
      level: 1,
      exp: 0,
      nextExp: 20,
      kills: 0,
      magnetRadius: 110,
      facing: 1,
      isMoving: false,
      walkCycle: 0,
      invulnerableTimer: 0,
      might: 1.0,
      cooldownReduction: 1.0,
      critChance: 0.15,
      critDamage: 2.0,
      weapons: {
        magicMissile: {
          level: 1,
          damage: 28,
          cooldown: 0.72,
          timer: 0,
          count: 1,
          pierce: 1,
          speed: 8.8
        },
        spinningAura: {
          level: 1,
          damage: 15,
          count: 2,
          orbitRadius: 65,
          angle: 0,
          speed: 3.6,
          orbRadius: 10
        },
        lightning: {
          level: 0,
          damage: 60,
          cooldown: 2.6,
          timer: 0,
          count: 1
        },
        fireball: {
          level: 0,
          damage: 50,
          cooldown: 2.0,
          timer: 0,
          radius: 40
        }
      }
    },
    enemies: [],
    dropItems: [],
    projectiles: [],
    particles: [],
    damageNumbers: [],
    lightningEffects: [],
    keys: {},
    nextEnemyId: 1,
    nextItemId: 1,
    nextDamageId: 1,
    spawnTimer: 0,
    lastBossTime: 0,
    gameTime: 0,
    isOver: false,
    isLevelUpPause: false,
    isGamePaused: false,
    lastFrameTime: performance.now(),
    screenShake: 0,
    reaperSpawned: false,
    totalExpEarned: 0,
    totalDamageTaken: 0,
    totalDamageDealt: 0,
    deathCause: '마물들의 공격'
  });

  // Audio Toggles
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    const active = sound.toggleBgm();
    setBgmActive(active);
    if (active) {
      sound.startBgm();
    } else {
      sound.stopBgm();
    }
  };

  const handleTogglePause = () => {
    gameStateRef.current.isGamePaused = !gameStateRef.current.isGamePaused;
    setIsPaused(gameStateRef.current.isGamePaused);
  };

  // Download Standalone HTML file
  const handleDownloadStandaloneHtml = () => {
    const html = getStandaloneHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vampire_survivors_2d.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Standalone HTML code
  const handleCopyCode = () => {
    const html = getStandaloneHtml();
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Spawn Invincible 15-Minute Reaper
  const spawnReaper = () => {
    const state = gameStateRef.current;
    if (state.reaperSpawned) return;
    state.reaperSpawned = true;
    setReaperAlert(true);
    setTimeout(() => setReaperAlert(false), 5000);
    sound.playReaperBell();
    state.screenShake = 22;

    const p = state.player;
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 450;
    const ex = p.x + Math.cos(angle) * spawnDist;
    const ey = p.y + Math.sin(angle) * spawnDist;

    state.enemies.push({
      id: state.nextEnemyId++,
      type: 'reaper',
      x: ex,
      y: ey,
      vx: 0,
      vy: 0,
      radius: 42,
      hp: 99999999,
      maxHp: 99999999,
      speed: 5.6, // Fast and relentless, impossible to evade permanently
      damage: 9999, // Absolute lethal execution
      expValue: 0,
      color: '#dc2626',
      flashTimer: 0,
      animTimer: 0,
      isBoss: true,
      isInvincible: true
    });
  };

  // Dev / Testing Helper: Fast forward to 15:00 and spawn Reaper immediately
  const handleFastForward15m = () => {
    const state = gameStateRef.current;
    if (state.isOver) return;
    if (state.gameTime < 900) {
      state.gameTime = 900;
      setGameTime(900);
    }
    spawnReaper();
  };

  // Reset / Start Game
  const restartGame = () => {
    const state = gameStateRef.current;
    state.player.x = 0;
    state.player.y = 0;
    state.player.hp = 100;
    state.player.maxHp = 100;
    state.player.level = 1;
    state.player.exp = 0;
    state.player.nextExp = 20;
    state.player.kills = 0;
    state.player.speed = 3.3;
    state.player.magnetRadius = 110;
    state.player.might = 1.0;
    state.player.cooldownReduction = 1.0;
    state.player.critChance = 0.15;
    state.player.invulnerableTimer = 0;

    state.player.weapons.magicMissile = {
      level: 1,
      damage: 28,
      cooldown: 0.72,
      timer: 0,
      count: 1,
      pierce: 1,
      speed: 8.8
    };
    state.player.weapons.spinningAura = {
      level: 1,
      damage: 15,
      count: 2,
      orbitRadius: 65,
      angle: 0,
      speed: 3.6,
      orbRadius: 10
    };
    state.player.weapons.lightning = {
      level: 0,
      damage: 60,
      cooldown: 2.6,
      timer: 0,
      count: 1
    };
    state.player.weapons.fireball = {
      level: 0,
      damage: 50,
      cooldown: 2.0,
      timer: 0,
      radius: 40
    };

    state.enemies = [];
    state.dropItems = [];
    state.projectiles = [];
    state.particles = [];
    state.damageNumbers = [];
    state.lightningEffects = [];
    state.gameTime = 0;
    state.spawnTimer = 0;
    state.lastBossTime = 0;
    state.isOver = false;
    state.isLevelUpPause = false;
    state.isGamePaused = false;
    state.screenShake = 0;
    state.reaperSpawned = false;
    state.totalExpEarned = 0;
    state.totalDamageTaken = 0;
    state.totalDamageDealt = 0;
    state.deathCause = '마물들의 공격';

    setLevel(1);
    setExp(0);
    setNextExp(20);
    setHp(100);
    setMaxHp(100);
    setKills(0);
    setGameTime(0);
    setIsGameOver(false);
    setIsLevelingUp(false);
    setIsPaused(false);
    setBossAlert(false);
    setReaperAlert(false);
    setFinalStats(null);
  };

  // Generate 3 Upgrade Choices on Level Up
  const triggerLevelUp = () => {
    const state = gameStateRef.current;
    state.isLevelUpPause = true;
    setIsLevelingUp(true);
    sound.playLevelUp();

    const p = state.player;

    const availablePool: UpgradeOption[] = [
      {
        id: 'magicMissile',
        title: 'Magic Missile',
        koreanTitle: '마법 화살 연사 & 관통',
        desc: '발사 화살 수 +1 및 마법 공격력 25% 증가, 3레벨 달성 시 관통 추가',
        icon: '🏹',
        level: p.weapons.magicMissile.level,
        maxLevel: 8,
        type: 'weapon',
        rarity: 'rare'
      },
      {
        id: 'spinningAura',
        title: 'Spinning Holy Aura',
        koreanTitle: '회전 성스러운 오라',
        desc: '회전 오브 +1개 추가, 회전 속도 20% 증가 및 타격 범위 확대',
        icon: '🌀',
        level: p.weapons.spinningAura.level,
        maxLevel: 8,
        type: 'weapon',
        rarity: 'rare'
      },
      {
        id: 'lightning',
        title: 'Thunderbolt',
        koreanTitle: '천둥 벼락 습득/강화',
        desc: '주기적으로 적에게 강력한 낙뢰를 내리꽂아 치명적인 광역 피해',
        icon: '⚡',
        level: p.weapons.lightning.level,
        maxLevel: 6,
        type: 'weapon',
        rarity: p.weapons.lightning.level === 0 ? 'epic' : 'rare'
      },
      {
        id: 'might',
        title: 'Might of Titans',
        koreanTitle: '거인의 힘 (전체 공격력)',
        desc: '모든 무기의 타격 공격력 +20% 영구 증폭',
        icon: '⚔️',
        level: Math.round((p.might - 1.0) / 0.2),
        maxLevel: 5,
        type: 'passive',
        rarity: 'common'
      },
      {
        id: 'speed',
        title: 'Swift Boots',
        koreanTitle: '신속의 장화 (이동속도)',
        desc: '플레이어 이동 속도 +15% 증가로 적 포위망 돌파',
        icon: '👟',
        level: Math.round((p.speed - 3.3) / 0.5),
        maxLevel: 5,
        type: 'passive',
        rarity: 'common'
      },
      {
        id: 'magnet',
        title: 'Attraction Magnet',
        koreanTitle: '자석 흡수 범위 확대',
        desc: '경험치 보석 및 아이템 자석 흡수 반경 +45% 대폭 증가',
        icon: '🧲',
        level: Math.round((p.magnetRadius - 110) / 50),
        maxLevel: 5,
        type: 'passive',
        rarity: 'common'
      },
      {
        id: 'vitality',
        title: 'Divine Vitality',
        koreanTitle: '신성한 생명력 (최대 체력 & 회복)',
        desc: '최대 체력 +35 증가 및 잃은 체력 전액 100% 즉시 회복',
        icon: '❤️',
        level: Math.round((p.maxHp - 100) / 35),
        maxLevel: 5,
        type: 'passive',
        rarity: 'rare'
      },
      {
        id: 'cooldown',
        title: 'Chronos Haste',
        koreanTitle: '시간의 가속 (쿨타임 단축)',
        desc: '모든 무기 공격 대기시간 15% 단축으로 압도적인 DPS 실현',
        icon: '⏳',
        level: Math.round((1.0 - p.cooldownReduction) / 0.12),
        maxLevel: 5,
        type: 'passive',
        rarity: 'rare'
      },
      {
        id: 'crit',
        title: 'Deadly Precision',
        koreanTitle: '치명타 적중률 (크리티컬)',
        desc: '치명타 확률 +12% 증가 및 치명타 배수 2.5배로 상승',
        icon: '🎯',
        level: Math.round((p.critChance - 0.15) / 0.12),
        maxLevel: 5,
        type: 'passive',
        rarity: 'epic'
      }
    ];

    const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
    setUpgradeChoices(shuffled.slice(0, 3));
  };

  // Apply Upgrade Selection
  const applyUpgrade = (choiceId: string) => {
    const state = gameStateRef.current;
    const p = state.player;

    switch (choiceId) {
      case 'magicMissile':
        p.weapons.magicMissile.level++;
        p.weapons.magicMissile.count++;
        p.weapons.magicMissile.damage = Math.round(p.weapons.magicMissile.damage * 1.25);
        if (p.weapons.magicMissile.level >= 3) {
          p.weapons.magicMissile.pierce++;
        }
        break;
      case 'spinningAura':
        p.weapons.spinningAura.level++;
        p.weapons.spinningAura.count++;
        p.weapons.spinningAura.speed += 0.6;
        p.weapons.spinningAura.damage = Math.round(p.weapons.spinningAura.damage * 1.2);
        p.weapons.spinningAura.orbitRadius += 6;
        break;
      case 'lightning':
        p.weapons.lightning.level++;
        p.weapons.lightning.count = Math.min(5, p.weapons.lightning.count + 1);
        p.weapons.lightning.damage += 35;
        p.weapons.lightning.cooldown = Math.max(1.1, p.weapons.lightning.cooldown * 0.85);
        break;
      case 'might':
        p.might += 0.2;
        break;
      case 'speed':
        p.speed += 0.5;
        break;
      case 'magnet':
        p.magnetRadius += 50;
        break;
      case 'vitality':
        p.maxHp += 35;
        p.hp = p.maxHp;
        setMaxHp(p.maxHp);
        setHp(p.hp);
        break;
      case 'cooldown':
        p.cooldownReduction = Math.max(0.4, p.cooldownReduction * 0.85);
        break;
      case 'crit':
        p.critChance += 0.12;
        p.critDamage = 2.5;
        break;
    }

    state.isLevelUpPause = false;
    setIsLevelingUp(false);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      gameStateRef.current.keys[key] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }
      if (key === 'p') {
        handleTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Helpers
    const addDamageNumber = (
      x: number,
      y: number,
      amount: number | string,
      isCrit: boolean = false,
      customColor?: string
    ) => {
      const state = gameStateRef.current;
      const text = typeof amount === 'number' ? Math.round(amount).toString() : amount;
      state.damageNumbers.push({
        id: state.nextDamageId++,
        x: x + (Math.random() - 0.5) * 16,
        y: y - 10,
        text,
        color: customColor ? customColor : isCrit ? '#facc15' : '#ffffff',
        life: 0.85,
        maxLife: 0.85,
        isCritical: isCrit
      });
    };

    const addParticles = (x: number, y: number, color: string, count: number = 6) => {
      const state = gameStateRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 3.5;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          radius: 2 + Math.random() * 3,
          life: 0.35 + Math.random() * 0.35,
          maxLife: 0.7
        });
      }
    };

    const spawnEnemy = (width: number, height: number) => {
      const state = gameStateRef.current;
      const p = state.player;
      const edge = Math.floor(Math.random() * 4);
      const margin = 80;
      let ex = 0;
      let ey = 0;

      if (edge === 0) {
        ex = p.x + (Math.random() - 0.5) * (width + margin * 2);
        ey = p.y - height / 2 - margin;
      } else if (edge === 1) {
        ex = p.x + (Math.random() - 0.5) * (width + margin * 2);
        ey = p.y + height / 2 + margin;
      } else if (edge === 2) {
        ex = p.x - width / 2 - margin;
        ey = p.y + (Math.random() - 0.5) * (height + margin * 2);
      } else {
        ex = p.x + width / 2 + margin;
        ey = p.y + (Math.random() - 0.5) * (height + margin * 2);
      }

      const t = state.gameTime;
      const rand = Math.random();

      let type: MonsterType = 'bat';
      let hp = 18 + Math.floor(t * 0.9);
      let speed = 1.8 + Math.random() * 0.4;
      let radius = 13;
      let color = '#a855f7';
      let expVal = 10;
      let damage = 6;

      if (t > 40 && rand > 0.4) {
        type = 'zombie';
        hp = 45 + Math.floor(t * 1.5);
        speed = 1.35;
        radius = 16;
        color = '#22c55e';
        expVal = 20;
        damage = 10;
      }
      if (t > 90 && rand > 0.7) {
        type = 'skeleton';
        hp = 85 + Math.floor(t * 2.3);
        speed = 1.6;
        radius = 15;
        color = '#e2e8f0';
        expVal = 35;
        damage = 14;
      }
      if (t > 140 && rand > 0.88) {
        type = 'demon';
        hp = 230 + Math.floor(t * 4.2);
        speed = 1.45;
        radius = 23;
        color = '#ef4444';
        expVal = 95;
        damage = 22;
      }

      state.enemies.push({
        id: state.nextEnemyId++,
        type,
        x: ex,
        y: ey,
        vx: 0,
        vy: 0,
        radius,
        hp,
        maxHp: hp,
        speed,
        damage,
        expValue: expVal,
        color,
        flashTimer: 0,
        animTimer: Math.random() * 10
      });
    };

    const checkBoss = (width: number, height: number) => {
      const state = gameStateRef.current;
      const t = state.gameTime;

      // Regular mid-boss every ~105s before 15:00
      if (t >= 75 && t < 900 && t - state.lastBossTime >= 105) {
        state.lastBossTime = t;
        setBossAlert(true);
        setTimeout(() => setBossAlert(false), 3500);

        const p = state.player;
        const angle = Math.random() * Math.PI * 2;
        const ex = p.x + Math.cos(angle) * (width / 2 + 60);
        const ey = p.y + Math.sin(angle) * (height / 2 + 60);
        const bossHp = 950 + t * 25;

        state.enemies.push({
          id: state.nextEnemyId++,
          type: 'boss',
          x: ex,
          y: ey,
          vx: 0,
          vy: 0,
          radius: 36,
          hp: bossHp,
          maxHp: bossHp,
          speed: 1.4,
          damage: 30,
          expValue: 350,
          color: '#e11d48',
          flashTimer: 0,
          animTimer: 0,
          isBoss: true
        });

        sound.playLightning();
        state.screenShake = 12;
      }
    };

    // Check 15-Minute Invincible Reaper Event (900 seconds)
    const checkReaperEvent = () => {
      const state = gameStateRef.current;
      if (state.gameTime >= 900 && !state.reaperSpawned && !state.isOver) {
        spawnReaper();
      }
    };

    // Main Update Function
    const update = (dt: number, width: number, height: number) => {
      const state = gameStateRef.current;
      if (state.isOver || state.isLevelUpPause || state.isGamePaused) return;

      state.gameTime += dt;
      setGameTime(state.gameTime);

      if (state.screenShake > 0) {
        state.screenShake -= dt * 25;
        if (state.screenShake < 0) state.screenShake = 0;
      }

      checkBoss(width, height);
      checkReaperEvent();

      // Enemy Spawning (slows down once Reaper is present)
      state.spawnTimer += dt;
      const spawnInterval = state.reaperSpawned ? 1.5 : Math.max(0.18, 1.0 - (state.gameTime / 180) * 0.75);
      if (state.spawnTimer >= spawnInterval && state.enemies.length < 280) {
        state.spawnTimer = 0;
        spawnEnemy(width, height);
      }

      const p = state.player;

      // Movement Input (Keyboard + Virtual Joystick)
      let dx = 0;
      let dy = 0;
      const k = state.keys;
      if (k['w'] || k['arrowup']) dy -= 1;
      if (k['s'] || k['arrowdown']) dy += 1;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;

      if (touchActive && (touchDirRef.current.x !== 0 || touchDirRef.current.y !== 0)) {
        dx = touchDirRef.current.x;
        dy = touchDirRef.current.y;
      }

      const len = Math.hypot(dx, dy);
      if (len > 0.05) {
        p.x += (dx / len) * p.speed;
        p.y += (dy / len) * p.speed;
        p.walkCycle += dt * 10;
        p.isMoving = true;
        if (dx !== 0) p.facing = dx > 0 ? 1 : -1;
      } else {
        p.isMoving = false;
      }

      if (p.invulnerableTimer > 0) {
        p.invulnerableTimer -= dt;
      }

      // --- WEAPON 1: Magic Missile (가장 가까운 적 자동 발사) ---
      const mm = p.weapons.magicMissile;
      mm.timer += dt;
      if (mm.timer >= mm.cooldown * p.cooldownReduction) {
        mm.timer = 0;
        const sorted = [...state.enemies]
          .map((e) => ({ enemy: e, dist: Math.hypot(e.x - p.x, e.y - p.y) }))
          .sort((a, b) => a.dist - b.dist);

        const count = Math.min(mm.count, sorted.length);
        for (let i = 0; i < count; i++) {
          const target = sorted[i].enemy;
          const angle = Math.atan2(target.y - p.y, target.x - p.x);
          const isCrit = Math.random() < p.critChance;
          const dmg = mm.damage * p.might * (isCrit ? p.critDamage : 1.0);

          state.projectiles.push({
            id: Math.random(),
            type: 'magic_missile',
            x: p.x,
            y: p.y,
            vx: Math.cos(angle) * mm.speed,
            vy: Math.sin(angle) * mm.speed,
            damage: dmg,
            radius: 8,
            pierce: mm.pierce,
            life: 2.3,
            maxLife: 2.3,
            color: '#38bdf8',
            glowColor: '#0284c7'
          });
        }
        if (count > 0) sound.playShoot();
      }

      // --- WEAPON 2: Spinning Holy Aura (주위를 회전하는 오라) ---
      const sa = p.weapons.spinningAura;
      sa.angle += sa.speed * dt;

      // --- WEAPON 3: Lightning Strike (번개 낙뢰) ---
      const lt = p.weapons.lightning;
      if (lt.level > 0) {
        lt.timer += dt;
        if (lt.timer >= lt.cooldown * p.cooldownReduction && state.enemies.length > 0) {
          lt.timer = 0;
          sound.playLightning();
          for (let i = 0; i < lt.count; i++) {
            const target = state.enemies[Math.floor(Math.random() * state.enemies.length)];
            if (!target) continue;

            if (target.isInvincible) {
              addDamageNumber(target.x, target.y, '무적', false, '#94a3b8');
              target.flashTimer = 0.1;
              addParticles(target.x, target.y, '#94a3b8', 6);
            } else {
              const isCrit = Math.random() < p.critChance;
              const dmg = lt.damage * p.might * (isCrit ? p.critDamage : 1.0);
              target.hp -= dmg;
              state.totalDamageDealt += dmg;
              target.flashTimer = 0.15;
              addDamageNumber(target.x, target.y, dmg, isCrit);
              addParticles(target.x, target.y, '#38bdf8', 8);
            }

            // Lightning Bolt Segments
            const segs = [{ x: target.x, y: target.y - 350 }];
            let currX = target.x;
            let currY = target.y - 350;
            while (currY < target.y) {
              currY += 25 + Math.random() * 20;
              currX += (Math.random() - 0.5) * 35;
              segs.push({ x: currX, y: currY });
            }
            segs.push({ x: target.x, y: target.y });
            state.lightningEffects.push({
              id: Math.random(),
              startX: target.x,
              startY: target.y - 350,
              targetX: target.x,
              targetY: target.y,
              life: 0.22,
              maxLife: 0.22,
              segments: segs
            });
          }
        }
      }

      // Update Projectiles
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const pr = state.projectiles[i];
        pr.x += pr.vx;
        pr.y += pr.vy;
        pr.life -= dt;

        for (let j = 0; j < state.enemies.length; j++) {
          const e = state.enemies[j];
          if (Math.hypot(pr.x - e.x, pr.y - e.y) < pr.radius + e.radius) {
            if (e.isInvincible) {
              // Invincible Reaper ignores all damage
              addDamageNumber(e.x, e.y, '무적', false, '#94a3b8');
              addParticles(e.x, e.y, '#64748b', 3);
            } else {
              const isCrit = Math.random() < p.critChance;
              const dmg = isCrit ? pr.damage * p.critDamage : pr.damage;
              e.hp -= dmg;
              state.totalDamageDealt += dmg;
              e.flashTimer = 0.12;
              addDamageNumber(e.x, e.y, dmg, isCrit);
              addParticles(e.x, e.y, pr.color, 4);
            }
            pr.pierce--;
            if (pr.pierce <= 0) {
              pr.life = 0;
              break;
            }
          }
        }

        if (pr.life <= 0) {
          state.projectiles.splice(i, 1);
        }
      }

      // Update Enemies & Collisions
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.animTimer += dt * 5;
        if (e.flashTimer > 0) e.flashTimer -= dt;

        const edx = p.x - e.x;
        const edy = p.y - e.y;
        const edist = Math.hypot(edx, edy);
        if (edist > 1) {
          e.x += (edx / edist) * e.speed;
          e.y += (edy / edist) * e.speed;
        }

        // Aura Collision
        for (let a = 0; a < sa.count; a++) {
          const orbAngle = sa.angle + (Math.PI * 2 / sa.count) * a;
          const ox = p.x + Math.cos(orbAngle) * sa.orbitRadius;
          const oy = p.y + Math.sin(orbAngle) * sa.orbitRadius;
          if (Math.hypot(ox - e.x, oy - e.y) < sa.orbRadius + e.radius) {
            if (e.isInvincible) {
              if (Math.random() < 0.1) {
                addDamageNumber(e.x, e.y, '무적', false, '#94a3b8');
              }
            } else {
              const dmg = sa.damage * p.might * dt * 4;
              e.hp -= dmg;
              state.totalDamageDealt += dmg;
              e.flashTimer = 0.08;
              if (Math.random() < 0.22) {
                addDamageNumber(e.x, e.y, sa.damage, false);
                sound.playAuraHit();
                addParticles(ox, oy, '#facc15', 2);
              }
            }
          }
        }

        // Damage Player
        if (edist < p.radius + e.radius && p.invulnerableTimer <= 0) {
          const incomingDmg = e.damage;
          p.hp -= incomingDmg;
          state.totalDamageTaken += incomingDmg;
          p.invulnerableTimer = e.isInvincible ? 0.05 : 0.4;
          setHp(Math.max(0, p.hp));

          if (e.isInvincible) {
            sound.playReaperSlash();
            state.screenShake = 16;
            state.deathCause = '무적의 사신(The Reaper)의 붉은 낫에 영혼을 거둠당함 (15분 타임오버)';
          } else {
            sound.playPlayerHurt();
            state.screenShake = 6;
            state.deathCause = '마물들의 끝없는 공세에 체력 고갈로 쓰러짐';
          }
          addParticles(p.x, p.y, '#f43f5e', 10);

          // Player Death
          if (p.hp <= 0) {
            p.hp = 0;
            state.isOver = true;
            setIsGameOver(true);
            sound.playGameOver();

            // Set detailed final run statistics
            const stats: RunStatistics = {
              totalExpEarned: state.totalExpEarned,
              currentExp: p.exp,
              nextExp: p.nextExp,
              totalDamageTaken: state.totalDamageTaken,
              totalDamageDealt: state.totalDamageDealt,
              survivalTime: state.gameTime,
              kills: p.kills,
              finalLevel: p.level,
              deathCause: state.deathCause
            };
            setFinalStats(stats);

            // Record Best Scores
            if (state.gameTime > bestTime) {
              setBestTime(state.gameTime);
              localStorage.setItem('vs_best_time', state.gameTime.toString());
            }
            if (p.kills > bestKills) {
              setBestKills(p.kills);
              localStorage.setItem('vs_best_kills', p.kills.toString());
            }
            return;
          }
        }

        // Enemy Death (Invincible enemies cannot die)
        if (e.hp <= 0 && !e.isInvincible) {
          sound.playDeath();
          p.kills++;
          setKills(p.kills);
          addParticles(e.x, e.y, e.color, 12);

          let gemType: DropItem['type'] = 'gem_blue';
          let gemColor = '#38bdf8';
          if (e.isBoss) {
            gemType = 'gem_red';
            gemColor = '#f43f5e';
          } else if (e.expValue > 25) {
            gemType = 'gem_green';
            gemColor = '#22c55e';
          }

          state.dropItems.push({
            id: state.nextItemId++,
            type: gemType,
            x: e.x,
            y: e.y,
            value: e.expValue,
            radius: 8,
            color: gemColor,
            isAttracted: false,
            vx: 0,
            vy: 0,
            sparkleTimer: 0
          });

          state.enemies.splice(i, 1);
        }
      }

      // Update Drop Items & Magnet
      for (let i = state.dropItems.length - 1; i >= 0; i--) {
        const item = state.dropItems[i];
        const dist = Math.hypot(p.x - item.x, p.y - item.y);

        if (dist < p.magnetRadius) {
          item.isAttracted = true;
        }

        if (item.isAttracted) {
          const pullAngle = Math.atan2(p.y - item.y, p.x - item.x);
          const pullSpeed = 4.0 + (p.magnetRadius - dist) * 0.12;
          item.x += Math.cos(pullAngle) * pullSpeed;
          item.y += Math.sin(pullAngle) * pullSpeed;

          if (dist < p.radius + item.radius) {
            sound.playGem();
            addParticles(item.x, item.y, item.color, 4);

            p.exp += item.value;
            state.totalExpEarned += item.value;

            if (p.exp >= p.nextExp) {
              p.exp -= p.nextExp;
              p.level++;
              p.nextExp = Math.floor(p.nextExp * 1.35 + 15);
              setLevel(p.level);
              setNextExp(p.nextExp);
              triggerLevelUp();
            }
            setExp(p.exp);

            state.dropItems.splice(i, 1);
          }
        }
      }

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const part = state.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life -= dt;
        if (part.life <= 0) state.particles.splice(i, 1);
      }

      // Update Damage Numbers
      for (let i = state.damageNumbers.length - 1; i >= 0; i--) {
        const dn = state.damageNumbers[i];
        dn.y -= dt * 38;
        dn.life -= dt;
        if (dn.life <= 0) state.damageNumbers.splice(i, 1);
      }

      // Update Lightning
      for (let i = state.lightningEffects.length - 1; i >= 0; i--) {
        const ltEff = state.lightningEffects[i];
        ltEff.life -= dt;
        if (ltEff.life <= 0) state.lightningEffects.splice(i, 1);
      }
    };

    // Main Render Function
    const render = (width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      const state = gameStateRef.current;
      const p = state.player;

      // Screen Shake
      let shakeX = 0;
      let shakeY = 0;
      if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake;
        shakeY = (Math.random() - 0.5) * state.screenShake;
      }

      // Camera: Player centered at (width/2, height/2)
      const camX = width / 2 - p.x + shakeX;
      const camY = height / 2 - p.y + shakeY;

      ctx.save();
      ctx.translate(camX, camY);

      // 1. Infinite Tiled Floor
      const tileSize = 64;
      const startX = Math.floor((p.x - width / 2) / tileSize) * tileSize - tileSize;
      const startY = Math.floor((p.y - height / 2) / tileSize) * tileSize - tileSize;
      const endX = startX + width + tileSize * 3;
      const endY = startY + height + tileSize * 3;

      for (let x = startX; x < endX; x += tileSize) {
        for (let y = startY; y < endY; y += tileSize) {
          const tileCol = Math.floor(x / tileSize);
          const tileRow = Math.floor(y / tileSize);
          const isAlt = (Math.abs(tileCol) + Math.abs(tileRow)) % 2 === 0;

          ctx.fillStyle = isAlt ? '#111420' : '#0d101a';
          ctx.fillRect(x, y, tileSize, tileSize);

          ctx.strokeStyle = '#181d2e';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);

          // Floor details
          if ((tileCol * 7 + tileRow * 13) % 19 === 0) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
            ctx.beginPath();
            ctx.arc(x + tileSize / 2, y + tileSize / 2, 14, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Drop Items (EXP Gems)
      state.dropItems.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(0, -item.radius);
        ctx.lineTo(item.radius * 0.8, 0);
        ctx.lineTo(0, item.radius);
        ctx.lineTo(-item.radius * 0.8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Projectiles
      state.projectiles.forEach((pr) => {
        ctx.save();
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.glowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. Lightning Bolts
      state.lightningEffects.forEach((ltEff) => {
        ctx.save();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ltEff.segments.forEach((seg, idx) => {
          if (idx === 0) ctx.moveTo(seg.x, seg.y);
          else ctx.lineTo(seg.x, seg.y);
        });
        ctx.stroke();
        ctx.restore();
      });

      // 5. Enemies (including the Invincible Grim Reaper)
      state.enemies.forEach((e) => {
        ctx.save();
        ctx.translate(e.x, e.y);

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(0, e.radius, e.radius * 0.85, e.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fill();

        ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : e.color;

        // Custom Render for the Invincible Reaper (사신)
        if (e.type === 'reaper') {
          // Dark menacing blood aura
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 24;

          // Flowing Crimson Cloak Body
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, -6, e.radius * 0.75, 0, Math.PI * 2);
          ctx.fill();

          // Outer Ragged Red Shroud
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.moveTo(-e.radius * 0.8, 8);
          ctx.lineTo(0, -e.radius * 1.1);
          ctx.lineTo(e.radius * 0.8, 8);
          ctx.lineTo(e.radius * 0.5, e.radius * 1.2);
          ctx.lineTo(-e.radius * 0.5, e.radius * 1.2);
          ctx.closePath();
          ctx.fill();

          // Skeletal Mask Face
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.arc(0, -8, e.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Piercing Crimson Eyes
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(-6, -9, 3, 0, Math.PI * 2);
          ctx.arc(6, -9, 3, 0, Math.PI * 2);
          ctx.fill();

          // Death Scythe (낫)
          ctx.save();
          const scytheAngle = Math.sin(e.animTimer * 2) * 0.25 - 0.3;
          ctx.rotate(scytheAngle);
          // Handle
          ctx.fillStyle = '#475569';
          ctx.fillRect(-3, -e.radius * 1.5, 6, e.radius * 2.4);
          // Curved Blade
          ctx.fillStyle = '#e2e8f0';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(0, -e.radius * 1.5);
          ctx.quadraticCurveTo(e.radius * 1.6, -e.radius * 2.0, e.radius * 1.7, -e.radius * 0.8);
          ctx.quadraticCurveTo(e.radius * 1.1, -e.radius * 1.2, 0, -e.radius * 1.3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // "사신 (무적)" Overhead Label
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText('💀 사신 (무적 IMMUNE)', 0, -e.radius - 12);
        } else if (e.type === 'bat') {
          const flap = Math.sin(e.animTimer * 2) * 6;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.beginPath();
          ctx.moveTo(-e.radius * 0.4, 0);
          ctx.lineTo(-e.radius * 1.35, -flap);
          ctx.lineTo(-e.radius * 0.6, 4);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(e.radius * 0.4, 0);
          ctx.lineTo(e.radius * 1.35, -flap);
          ctx.lineTo(e.radius * 0.6, 4);
          ctx.closePath();
          ctx.fill();
        } else if (e.isBoss) {
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          // Horns / Crown
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(-16, -20);
          ctx.lineTo(-24, -38);
          ctx.lineTo(-6, -28);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(16, -20);
          ctx.lineTo(24, -38);
          ctx.lineTo(6, -28);
          ctx.closePath();
          ctx.fill();
          // Glowing Eyes
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(-8, -4, 4, 0, Math.PI * 2);
          ctx.arc(8, -4, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
          ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Enemy HP Bar (Not drawn for invincible reaper)
        if (!e.isInvincible) {
          const barW = e.radius * 2;
          const barH = 4;
          const hpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-barW / 2, -e.radius - 8, barW, barH);
          ctx.fillStyle = e.isBoss ? '#f43f5e' : '#22c55e';
          ctx.fillRect(-barW / 2, -e.radius - 8, barW * hpPct, barH);
        }

        ctx.restore();
      });

      // 6. Player & Overhead HP Bar
      ctx.save();
      ctx.translate(p.x, p.y);

      // Player shadow
      ctx.beginPath();
      ctx.ellipse(0, p.radius, p.radius * 0.9, p.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fill();

      // Walking bob
      const bob = Math.sin(p.walkCycle) * 2;

      // Player Body / Cloak
      ctx.fillStyle = p.invulnerableTimer > 0 ? '#fda4af' : '#6366f1';
      ctx.beginPath();
      ctx.arc(0, bob, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner Rune / Knight Armor
      ctx.fillStyle = '#e0e7ff';
      ctx.beginPath();
      ctx.arc(0, bob - 2, p.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Eyes / Visor
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fillRect(p.facing > 0 ? 1 : -7, bob - 4, 6, 3);

      // Overhead HP Bar (필수 사양)
      const pBarW = 42;
      const pBarH = 5;
      const pHpPct = Math.max(0, p.hp / p.maxHp);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-pBarW / 2, -p.radius - 16, pBarW, pBarH);
      ctx.fillStyle = pHpPct > 0.35 ? '#22c55e' : '#ef4444';
      ctx.fillRect(-pBarW / 2, -p.radius - 16, pBarW * pHpPct, pBarH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-pBarW / 2, -p.radius - 16, pBarW, pBarH);

      // Magnet Circle (Subtle indicator)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.magnetRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 7. Spinning Aura Orbs
      const sa = p.weapons.spinningAura;
      for (let a = 0; a < sa.count; a++) {
        const orbAngle = sa.angle + (Math.PI * 2 / sa.count) * a;
        const ox = Math.cos(orbAngle) * sa.orbitRadius;
        const oy = Math.sin(orbAngle) * sa.orbitRadius;

        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ox, oy, sa.orbRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, sa.orbRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // 8. Particles
      state.particles.forEach((part) => {
        ctx.save();
        ctx.fillStyle = part.color;
        ctx.globalAlpha = Math.max(0, part.life / part.maxLife);
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 9. Floating Damage Numbers
      state.damageNumbers.forEach((dn) => {
        ctx.save();
        ctx.fillStyle = dn.color;
        ctx.font = dn.isCritical ? 'bold 18px monospace' : 'bold 14px monospace';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.globalAlpha = Math.max(0, dn.life / dn.maxLife);
        ctx.fillText(dn.text, dn.x, dn.y);
        ctx.restore();
      });

      ctx.restore();
    };

    // Animation Loop
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - gameStateRef.current.lastFrameTime) / 1000, 0.1);
      gameStateRef.current.lastFrameTime = timestamp;

      update(dt, canvas.width, canvas.height);
      render(canvas.width, canvas.height);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bestKills, bestTime]);

  // Touch Virtual Joystick Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setTouchActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenterRef.current.x;
    const dy = touch.clientY - joystickCenterRef.current.y;
    const dist = Math.hypot(dx, dy);
    const maxDist = 45;
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxDist);

    touchDirRef.current = {
      x: (clampedDist / maxDist) * Math.cos(angle),
      y: (clampedDist / maxDist) * Math.sin(angle)
    };

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
    }
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    touchDirRef.current = { x: 0, y: 0 };
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  // Timer formatting
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const expPercentage = Math.min(100, Math.floor((exp / nextExp) * 100));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0c12] select-none">
      {/* 2D Canvas Engine */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Top HUD: EXP Bar, Stats & Controls */}
      <div className="absolute top-0 left-0 w-full p-3 md:p-4 flex flex-col gap-2 pointer-events-none z-20">
        {/* EXP Bar */}
        <div className="w-full h-3.5 bg-slate-900/80 border border-sky-500/40 rounded-full overflow-hidden relative shadow-[0_0_12px_rgba(56,189,248,0.25)]">
          <div
            className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-indigo-400 transition-all duration-150 ease-out shadow-[0_0_8px_#38bdf8]"
            style={{ width: `${expPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-sky-100 drop-shadow">
            EXP {exp} / {nextExp} ({expPercentage}%)
          </div>
        </div>

        {/* Status Row */}
        <div className="flex justify-between items-center text-sm font-bold text-white drop-shadow">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 border border-sky-400/80 text-sky-400 px-2.5 py-1 rounded-md text-xs tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="w-3.5 h-3.5" /> LV {level}
            </span>
            <span className="bg-slate-900/90 border border-emerald-500/80 text-emerald-400 px-2.5 py-1 rounded-md text-xs tracking-wider flex items-center gap-1 shadow">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {Math.round(hp)} / {maxHp}
            </span>
          </div>

          {/* Survival Timer */}
          <div
            className={`bg-slate-950/90 border px-4 py-1 rounded-lg text-lg font-mono tracking-widest shadow-lg ${
              gameTime >= 900 ? 'border-rose-500 text-rose-400 animate-pulse' : 'border-slate-700/80 text-slate-100'
            }`}
          >
            {formatTime(gameTime)}
            {gameTime >= 900 && <span className="ml-2 text-xs text-rose-500 font-sans font-bold">⚠️ 사신 강림</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 border border-rose-500/80 text-rose-400 px-2.5 py-1 rounded-md text-xs tracking-wider flex items-center gap-1 shadow">
              <Skull className="w-3.5 h-3.5" /> {kills}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Action Controls (Top Right) */}
      <div className="absolute top-14 right-3 md:right-4 flex items-center gap-1.5 md:gap-2 z-20 pointer-events-auto">
        {/* Fast-forward / Test 15-Minute Reaper Button */}
        {!isGameOver && (
          <button
            onClick={handleFastForward15m}
            title="15분 무적의 사신(Reaper) 즉시 소환 테스트"
            className="bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-600/80 rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1 transition shadow-lg cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">15분 사신 소환(테스트)</span>
          </button>
        )}

        <button
          onClick={handleToggleSound}
          title="사운드 효과 토글"
          className="bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-sky-400 border border-slate-700 hover:border-sky-500/60 rounded-lg p-2 text-xs flex items-center gap-1 transition shadow-lg cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={handleToggleBgm}
          title="배경음악 토글"
          className={`bg-slate-900/85 hover:bg-slate-800 border rounded-lg p-2 text-xs flex items-center gap-1 transition shadow-lg cursor-pointer ${
            bgmActive ? 'border-sky-400 text-sky-400' : 'border-slate-700 text-slate-400'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        <button
          onClick={handleTogglePause}
          title="게임 일시정지"
          className="bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500/60 rounded-lg p-2 text-xs flex items-center gap-1 transition shadow-lg cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Standalone HTML File Export Button */}
        <button
          onClick={handleDownloadStandaloneHtml}
          title="단일 HTML 파일로 즉시 다운로드"
          className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">단일 HTML</span>
        </button>

        <button
          onClick={() => setShowCodeModal(true)}
          title="단일 HTML 코드 복사 및 보기"
          className="bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-sky-400 border border-slate-700 rounded-lg p-2 text-xs flex items-center gap-1 transition shadow-lg cursor-pointer"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Control Guide Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-800/80 text-slate-400 text-xs px-4 py-2 rounded-full flex items-center gap-4 pointer-events-none z-10 shadow-lg backdrop-blur-sm">
        <span className="flex items-center gap-1 text-slate-300">
          <Move className="w-3.5 h-3.5 text-sky-400" /> 이동: <b>WASD</b> 또는 <b>방향키</b>
        </span>
        <span className="hidden sm:flex items-center gap-1 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> 공격: <b>자동 공격</b>
        </span>
        <span className="hidden md:flex items-center gap-1 text-rose-400 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" /> 15분 경과 시 <b>무적의 사신</b> 등장!
        </span>
      </div>

      {/* 15-Minute Reaper Alert Overlay */}
      {reaperAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-950/95 border-2 border-red-600 px-6 py-3 rounded-2xl text-red-200 font-black text-lg md:text-xl flex items-center gap-3 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.8)] z-30 pointer-events-none">
          <Skull className="w-7 h-7 text-red-500 animate-bounce" />
          <span>⏳ 15분 경과: 무적의 사신(The Reaper) 강림! 피할 수 없는 죽음이 닥쳐옵니다...</span>
        </div>
      )}

      {/* Regular Boss Incoming Warning Overlay */}
      {bossAlert && !reaperAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-rose-950/90 border-2 border-rose-600 px-6 py-2.5 rounded-xl text-rose-300 font-extrabold text-base flex items-center gap-3 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)] z-30 pointer-events-none">
          <Skull className="w-6 h-6 text-rose-500 animate-bounce" />
          ⚠️ 경고: 거대 악마 보스 출현! ⚠️
        </div>
      )}

      {/* Virtual Touch Joystick for Mobile */}
      <div
        className="block sm:hidden absolute bottom-8 left-8 w-28 h-28 rounded-full bg-white/5 border-2 border-white/20 z-30 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={joystickKnobRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-sky-500/80 shadow-[0_0_12px_#38bdf8] pointer-events-none"
        />
      </div>

      {/* LEVEL UP MODAL (게임 정지 후 3택 선택 UI) */}
      {isLevelingUp && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="text-amber-400 text-3xl md:text-4xl font-extrabold tracking-wider mb-1 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
            ⭐ LEVEL UP! ⭐
          </div>
          <div className="text-slate-400 text-sm mb-6">강화할 무기나 능력치를 선택하세요</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full max-w-3xl">
            {upgradeChoices.map((choice) => (
              <div
                key={choice.id}
                onClick={() => applyUpgrade(choice.id)}
                className={`bg-slate-900/90 border-2 hover:border-sky-400 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(56,189,248,0.25)] flex flex-col justify-between ${
                  choice.rarity === 'epic'
                    ? 'border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : choice.rarity === 'rare'
                    ? 'border-sky-500/60'
                    : 'border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="text-3xl w-12 h-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center">
                      {choice.icon}
                    </div>
                    <div>
                      <div className="text-base font-bold text-white leading-tight">{choice.koreanTitle}</div>
                      <div className="text-xs text-sky-400 font-semibold mt-0.5">
                        {choice.level === 0 ? '✨ 신규 습득' : `LV ${choice.level} ➔ LV ${choice.level + 1}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">{choice.desc}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="uppercase font-mono text-[10px] tracking-wide text-sky-300/80">{choice.type}</span>
                  <span
                    className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      choice.rarity === 'epic'
                        ? 'bg-purple-900/80 text-purple-200'
                        : choice.rarity === 'rare'
                        ? 'bg-sky-900/80 text-sky-200'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {choice.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER & DETAILED RUN RESULTS MODAL (사용자 요청: 내가 먹은 경험치, 끝날 때 기준 경험치, 받은 피해 등 정보창) */}
      {isGameOver && finalStats && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center my-auto animate-fadeIn">
            {/* Title */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <Skull className="w-9 h-9 text-rose-500" />
              <h2 className="text-rose-500 text-3xl md:text-4xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]">
                {finalStats.survivalTime >= 900 ? 'TIME EXPIRED' : 'GAME OVER'}
              </h2>
            </div>

            {/* Death Cause Badge */}
            <div className="inline-block bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs px-3.5 py-1.5 rounded-full font-medium my-3 shadow">
              사망 원인: <b>{finalStats.deathCause}</b>
            </div>

            {/* Primary Stat Highlights */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">생존 시간</div>
                <div className="text-xl font-mono font-bold text-sky-400">{formatTime(finalStats.survivalTime)}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">도달 레벨</div>
                <div className="text-xl font-bold text-amber-400">LV {finalStats.finalLevel}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold mb-0.5">처치한 적</div>
                <div className="text-xl font-mono font-bold text-rose-400">{finalStats.kills} 💀</div>
              </div>
            </div>

            {/* Detailed EXP & Combat Statistics Window */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-3.5 mb-6">
              {/* EXP Section */}
              <div>
                <div className="text-sky-400 font-bold flex items-center gap-1.5 mb-2 text-sm">
                  <Sparkles className="w-4 h-4" /> 경험치 정산 내역
                </div>
                <div className="space-y-1.5 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">💎 내가 먹은 총 경험치 (누적):</span>
                    <b className="text-sky-300 font-mono text-sm">{finalStats.totalExpEarned.toLocaleString()} EXP</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">📊 종료 시점 기준 보유 경험치:</span>
                    <b className="text-emerald-400 font-mono text-sm">
                      {finalStats.currentExp} / {finalStats.nextExp} EXP (
                      {Math.floor((finalStats.currentExp / finalStats.nextExp) * 100)}%)
                    </b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">다음 레벨까지 남은 경험치:</span>
                    <span className="text-slate-400 font-mono">{finalStats.nextExp - finalStats.currentExp} EXP</span>
                  </div>
                </div>
              </div>

              {/* Combat / Damage Section */}
              <div>
                <div className="text-rose-400 font-bold flex items-center gap-1.5 mb-2 text-sm">
                  <Swords className="w-4 h-4" /> 전투 & 피해량 분석
                </div>
                <div className="space-y-1.5 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">🩸 받은 총 피해량:</span>
                    <b className="text-rose-400 font-mono text-sm">
                      {Math.round(finalStats.totalDamageTaken).toLocaleString()} HP
                    </b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">⚡ 적에게 가한 총 피해량:</span>
                    <b className="text-amber-300 font-mono text-sm">
                      {Math.round(finalStats.totalDamageDealt).toLocaleString()} DMG
                    </b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">🏆 최고 기록 (기존):</span>
                    <span className="text-slate-400 font-mono">
                      {formatTime(bestTime)} / {bestKills}처치
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={restartGame}
              className="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-8 rounded-xl text-base shadow-[0_4px_25px_rgba(225,29,72,0.45)] hover:shadow-[0_6px_30px_rgba(225,29,72,0.65)] transform hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> 다시 시작하기
            </button>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {isPaused && !isGameOver && !isLevelingUp && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-40">
          <div className="text-amber-400 text-3xl font-extrabold mb-4 tracking-wider">⏸ 일시정지</div>
          <p className="text-slate-300 text-sm mb-6">게임이 일시 정지되었습니다.</p>
          <div className="flex gap-3">
            <button
              onClick={handleTogglePause}
              className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" /> 계속하기
            </button>
            <button
              onClick={handleFastForward15m}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600/80 px-4 py-2.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-lg text-sm"
            >
              <FastForward className="w-4 h-4" /> 15분 사신 즉시 소환
            </button>
          </div>
        </div>
      )}

      {/* STANDALONE SINGLE HTML CODE MODAL */}
      {showCodeModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-sky-400" /> 단일 HTML 파일 코드 (Standalone HTML)
                </h3>
                <p className="text-xs text-slate-400">
                  15분 무적의 사신 및 종합 통계 정보창이 포함된 순수 HTML+CSS+JS 코드입니다.
                </p>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">standalone_vampire_survivors.html</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '복사 완료!' : '전체 코드 복사'}
                </button>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow"
                >
                  <Download className="w-3.5 h-3.5" /> HTML 다운로드
                </button>
              </div>
            </div>

            <pre className="p-4 overflow-auto text-xs text-slate-300 font-mono bg-slate-950 flex-1 leading-relaxed selection:bg-sky-500 selection:text-white">
              {getStandaloneHtml()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
