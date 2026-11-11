/**
 * Standalone single HTML code string exporter.
 * Allows the user to download or copy the entire self-contained game as a single .html file.
 */

export function getStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Vampire Survivors 2D - Canvas Web Edition (뱀서라이크)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background-color: #0b0d14; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #fff; }
    #gameContainer { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #0a0c12; }
    canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
    #topHud { position: absolute; top: 0; left: 0; width: 100%; padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; pointer-events: none; z-index: 10; }
    .exp-bar-container { width: 100%; height: 14px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 7px; overflow: hidden; position: relative; box-shadow: 0 0 10px rgba(56, 189, 248, 0.2); }
    .exp-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #0284c7, #38bdf8, #818cf8); transition: width 0.15s ease-out; box-shadow: 0 0 8px #38bdf8; }
    .exp-bar-text { position: absolute; width: 100%; top: 0; left: 0; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #e0f2fe; text-shadow: 0 1px 2px #000; }
    .stats-row { display: flex; justify-content: space-between; align-items: center; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
    .level-badge { background: rgba(30, 41, 59, 0.85); border: 1px solid #38bdf8; border-radius: 6px; padding: 4px 10px; font-size: 13px; color: #38bdf8; display: flex; align-items: center; gap: 4px; }
    .timer-display { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 4px 16px; font-size: 20px; font-variant-numeric: tabular-nums; color: #f8fafc; letter-spacing: 1px; }
    .timer-display.reaper-active { border-color: #ef4444; color: #f87171; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    .kills-badge { background: rgba(30, 41, 59, 0.85); border: 1px solid #f43f5e; border-radius: 6px; padding: 4px 10px; font-size: 13px; color: #fb7185; display: flex; align-items: center; gap: 4px; }
    .top-right-controls { position: absolute; top: 48px; right: 16px; display: flex; gap: 8px; z-index: 15; pointer-events: auto; }
    .icon-btn { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); color: #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
    .icon-btn:hover { background: rgba(30, 41, 59, 0.95); border-color: #38bdf8; color: #38bdf8; }
    .icon-btn.reaper-btn { background: rgba(88, 28, 28, 0.85); border-color: #ef4444; color: #fca5a5; }
    .icon-btn.reaper-btn:hover { background: rgba(127, 29, 29, 0.95); color: #ffffff; }
    #reaperAlertBanner { display: none; position: absolute; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(127, 29, 29, 0.95); border: 2px solid #ef4444; border-radius: 12px; padding: 10px 24px; font-size: 16px; font-weight: 800; color: #fee2e2; z-index: 25; pointer-events: none; box-shadow: 0 0 30px rgba(239, 68, 68, 0.8); animation: pulse 1s infinite; }
    #levelUpModal { display: none; position: absolute; inset: 0; background: rgba(5, 7, 13, 0.85); backdrop-filter: blur(6px); z-index: 100; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .modal-title { font-size: 28px; font-weight: 800; color: #facc15; text-shadow: 0 0 16px rgba(250, 204, 21, 0.6); margin-bottom: 4px; letter-spacing: 1px; text-transform: uppercase; }
    .modal-subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
    .cards-container { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 440px; }
    @media (min-width: 680px) { .cards-container { flex-direction: row; max-width: 720px; } }
    .upgrade-card { flex: 1; background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)); border: 2px solid #334155; border-radius: 12px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
    .upgrade-card:hover { transform: translateY(-4px) scale(1.02); border-color: #38bdf8; box-shadow: 0 8px 24px rgba(56, 189, 248, 0.25); }
    .card-top { display: flex; align-items: center; gap: 10px; }
    .card-icon { font-size: 28px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.8); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .card-title-wrap { flex: 1; }
    .card-title { font-size: 15px; font-weight: 700; color: #f8fafc; }
    .card-level { font-size: 11px; color: #38bdf8; font-weight: 600; }
    .card-desc { font-size: 12px; color: #94a3b8; line-height: 1.4; flex: 1; }
    #gameOverModal { display: none; position: absolute; inset: 0; background: rgba(10, 5, 8, 0.92); backdrop-filter: blur(8px); z-index: 100; flex-direction: column; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
    .result-card { width: 100%; max-width: 480px; background: rgba(15, 23, 42, 0.95); border: 2px solid rgba(244, 63, 94, 0.4); border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 0 50px rgba(244, 63, 94, 0.25); }
    .go-title { font-size: 36px; font-weight: 900; color: #f43f5e; text-shadow: 0 0 20px rgba(244, 63, 94, 0.7); margin-bottom: 4px; }
    .death-cause-badge { display: inline-block; background: rgba(127, 29, 29, 0.7); border: 1px solid #ef4444; color: #fca5a5; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .summary-box { background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 10px 6px; }
    .summary-box .label { font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
    .summary-box .val { font-size: 17px; font-weight: 800; }
    .details-section { background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; text-align: left; font-size: 12px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
    .section-title { font-weight: 700; color: #38bdf8; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .detail-row { display: flex; justify-content: space-between; color: #cbd5e1; padding: 3px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .detail-row:last-child { border-bottom: none; }
    .detail-val { font-weight: 700; font-family: monospace; }
    .btn-restart { width: 100%; background: linear-gradient(135deg, #e11d48, #be123c); color: #fff; border: none; border-radius: 12px; padding: 14px 32px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(225, 29, 72, 0.4); transition: all 0.2s; }
    .btn-restart:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(225, 29, 72, 0.6); }
    #startHint { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 8px 18px; font-size: 12px; color: #94a3b8; pointer-events: none; z-index: 10; display: flex; gap: 12px; }
  </style>
</head>
<body>
  <div id="gameContainer">
    <canvas id="gameCanvas"></canvas>
    <div id="topHud">
      <div class="exp-bar-container">
        <div id="expFill" class="exp-bar-fill"></div>
        <div id="expText" class="exp-bar-text">EXP 0 / 20</div>
      </div>
      <div class="stats-row">
        <div class="level-badge">LV <span id="hudLevel">1</span></div>
        <div class="timer-display" id="hudTimer">00:00</div>
        <div class="kills-badge">💀 <span id="hudKills">0</span></div>
      </div>
    </div>
    <div class="top-right-controls">
      <button class="icon-btn reaper-btn" id="btnFastReaper" title="15분 무적의 사신 즉시 소환 테스트">⚡ 15분 사신 소환</button>
      <button class="icon-btn" id="btnAudioToggle">🔊 사운드 ON</button>
      <button class="icon-btn" id="btnPauseToggle">⏸ 일시정지</button>
    </div>
    <div id="reaperAlertBanner">
      💀 15분 경과: 무적의 사신(Reaper) 강림! 피할 수 없는 죽음이 닥쳐옵니다...
    </div>
    <div id="startHint">
      <span>⌨️ 이동: <b>WASD</b> 또는 <b>방향키</b></span>
      <span>⚡ 공격: <b>자동 공격</b></span>
      <span style="color: #f87171;">⏳ 15분 경과 시 <b>무적의 사신</b> 출현</span>
    </div>
    <div id="levelUpModal">
      <div class="modal-title">⭐ LEVEL UP! ⭐</div>
      <div class="modal-subtitle">강화할 무기나 능력치를 선택하세요</div>
      <div class="cards-container" id="cardsContainer"></div>
    </div>
    <div id="gameOverModal">
      <div class="result-card">
        <div class="go-title" id="goTitle">GAME OVER</div>
        <div class="death-cause-badge" id="deathCauseBadge">사망 원인: 마물들의 공격</div>
        <div class="summary-grid">
          <div class="summary-box">
            <div class="label">생존 시간</div>
            <div class="val" id="resTime" style="color: #38bdf8;">00:00</div>
          </div>
          <div class="summary-box">
            <div class="label">도달 레벨</div>
            <div class="val" id="resLevel" style="color: #facc15;">LV 1</div>
          </div>
          <div class="summary-box">
            <div class="label">처치한 적</div>
            <div class="val" id="resKills" style="color: #fb7185;">0 💀</div>
          </div>
        </div>
        <div class="details-section">
          <div class="section-title">💎 경험치 정산 내역</div>
          <div class="detail-row">
            <span>내가 먹은 총 경험치 (누적):</span>
            <span class="detail-val" id="resTotalExp" style="color: #38bdf8;">0 EXP</span>
          </div>
          <div class="detail-row">
            <span>종료 시점 기준 보유 경험치:</span>
            <span class="detail-val" id="resCurrentExp" style="color: #4ade80;">0 / 20 EXP (0%)</span>
          </div>
          <div class="detail-row">
            <span>다음 레벨까지 남은 경험치:</span>
            <span class="detail-val" id="resRemainExp" style="color: #94a3b8;">20 EXP</span>
          </div>
          <div class="section-title" style="margin-top: 8px; color: #f43f5e;">⚔️ 전투 및 피해량 분석</div>
          <div class="detail-row">
            <span>받은 총 피해량:</span>
            <span class="detail-val" id="resDamageTaken" style="color: #f87171;">0 HP</span>
          </div>
          <div class="detail-row">
            <span>적에게 가한 총 피해량:</span>
            <span class="detail-val" id="resDamageDealt" style="color: #fbbf24;">0 DMG</span>
          </div>
        </div>
        <button class="btn-restart" id="btnRestart">다시 시작하기</button>
      </div>
    </div>
  </div>
  <script>
    class SoundEngine {
      constructor() { this.ctx = null; this.muted = false; }
      init() {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      }
      playShoot() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.12);
          g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.12);
        } catch(e){}
      }
      playAuraHit() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(90, t + 0.08);
          g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.08);
        } catch(e){}
      }
      playDeath() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.14);
          g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.14);
        } catch(e){}
      }
      playGem() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(659.25, t); o.frequency.exponentialRampToValueAtTime(987.77, t + 0.08);
          g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.08);
        } catch(e){}
      }
      playLevelUp() {
        if (this.muted) return;
        try {
          this.init();
          [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const t = this.ctx.currentTime + i * 0.08, o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.25);
          });
        } catch(e){}
      }
      playHurt() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'sawtooth'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
          g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.15);
        } catch(e){}
      }
      playReaperBell() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime;
          [110, 220, 440].forEach((f, i) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0.25 / (i + 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
            o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 1.8);
          });
        } catch(e){}
      }
      playReaperSlash() {
        if (this.muted) return;
        try {
          this.init();
          const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'sawtooth'; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.3);
          g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.35);
        } catch(e){}
      }
    }
    const sound = new SoundEngine();

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const expFill = document.getElementById('expFill');
    const expText = document.getElementById('expText');
    const hudLevel = document.getElementById('hudLevel');
    const hudTimer = document.getElementById('hudTimer');
    const hudKills = document.getElementById('hudKills');
    const levelUpModal = document.getElementById('levelUpModal');
    const cardsContainer = document.getElementById('cardsContainer');
    const gameOverModal = document.getElementById('gameOverModal');
    const btnRestart = document.getElementById('btnRestart');
    const btnAudioToggle = document.getElementById('btnAudioToggle');
    const btnPauseToggle = document.getElementById('btnPauseToggle');
    const btnFastReaper = document.getElementById('btnFastReaper');
    const reaperAlertBanner = document.getElementById('reaperAlertBanner');

    const goTitle = document.getElementById('goTitle');
    const deathCauseBadge = document.getElementById('deathCauseBadge');
    const resTime = document.getElementById('resTime');
    const resLevel = document.getElementById('resLevel');
    const resKills = document.getElementById('resKills');
    const resTotalExp = document.getElementById('resTotalExp');
    const resCurrentExp = document.getElementById('resCurrentExp');
    const resRemainExp = document.getElementById('resRemainExp');
    const resDamageTaken = document.getElementById('resDamageTaken');
    const resDamageDealt = document.getElementById('resDamageDealt');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });

    const keys = {};
    window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

    btnAudioToggle.addEventListener('click', () => { sound.muted = !sound.muted; btnAudioToggle.textContent = sound.muted ? '🔇 사운드 OFF' : '🔊 사운드 ON'; });
    let isPaused = false;
    btnPauseToggle.addEventListener('click', () => { isPaused = !isPaused; btnPauseToggle.textContent = isPaused ? '▶ 재개' : '⏸ 일시정지'; });

    let isGameOver = false, isLevelingUp = false, gameTime = 0;
    let nextEnemyId = 1, nextItemId = 1, nextDamageId = 1;
    let reaperSpawned = false, totalExpEarned = 0, totalDamageTaken = 0, totalDamageDealt = 0;
    let deathCause = '마물들의 공격';

    const player = {
      x: 0, y: 0, radius: 18, speed: 3.3, hp: 100, maxHp: 100, level: 1, exp: 0, nextExp: 20, kills: 0, magnetRadius: 110, facing: 1, walkCycle: 0, invulnerableTimer: 0, might: 1.0, cooldownMult: 1.0,
      weapons: {
        magicMissile: { level: 1, damage: 28, cooldown: 0.72, timer: 0, count: 1, pierce: 1, speed: 8.8 },
        spinningAura: { level: 1, damage: 15, count: 2, radius: 65, angle: 0, speed: 3.6, orbRadius: 10 }
      }
    };

    let enemies = [], dropItems = [], projectiles = [], particles = [], damageNumbers = [];

    function initGame() {
      player.x = 0; player.y = 0; player.hp = 100; player.maxHp = 100; player.level = 1; player.exp = 0; player.nextExp = 20; player.kills = 0; player.speed = 3.3; player.magnetRadius = 110; player.might = 1.0; player.cooldownMult = 1.0;
      player.weapons.magicMissile = { level: 1, damage: 28, cooldown: 0.72, timer: 0, count: 1, pierce: 1, speed: 8.8 };
      player.weapons.spinningAura = { level: 1, damage: 15, count: 2, radius: 65, angle: 0, speed: 3.6, orbRadius: 10 };
      enemies = []; dropItems = []; projectiles = []; particles = []; damageNumbers = []; gameTime = 0; isGameOver = false; isLevelingUp = false; isPaused = false;
      reaperSpawned = false; totalExpEarned = 0; totalDamageTaken = 0; totalDamageDealt = 0; deathCause = '마물들의 공격';
      hudTimer.classList.remove('reaper-active');
      reaperAlertBanner.style.display = 'none';
      gameOverModal.style.display = 'none'; levelUpModal.style.display = 'none'; updateHud();
    }
    btnRestart.addEventListener('click', initGame);

    function spawnReaper() {
      if (reaperSpawned) return;
      reaperSpawned = true;
      hudTimer.classList.add('reaper-active');
      reaperAlertBanner.style.display = 'block';
      setTimeout(() => { reaperAlertBanner.style.display = 'none'; }, 5000);
      sound.playReaperBell();

      const a = Math.random() * Math.PI * 2;
      enemies.push({
        id: nextEnemyId++, type: 'reaper', x: player.x + Math.cos(a) * 450, y: player.y + Math.sin(a) * 450, radius: 42,
        hp: 99999999, maxHp: 99999999, speed: 5.6, color: '#dc2626', damage: 9999, expValue: 0, flashTimer: 0, animTimer: 0, isBoss: true, isInvincible: true
      });
    }

    btnFastReaper.addEventListener('click', () => {
      if (isGameOver) return;
      if (gameTime < 900) gameTime = 900;
      spawnReaper();
    });

    let spawnTimer = 0;
    function spawnEnemy() {
      const edge = Math.floor(Math.random() * 4), margin = 80;
      let ex = 0, ey = 0;
      if (edge === 0) { ex = player.x + (Math.random() - 0.5) * (width + margin * 2); ey = player.y - height / 2 - margin; }
      else if (edge === 1) { ex = player.x + (Math.random() - 0.5) * (width + margin * 2); ey = player.y + height / 2 + margin; }
      else if (edge === 2) { ex = player.x - width / 2 - margin; ey = player.y + (Math.random() - 0.5) * (height + margin * 2); }
      else { ex = player.x + width / 2 + margin; ey = player.y + (Math.random() - 0.5) * (height + margin * 2); }

      let type = 'bat', hp = 18 + Math.floor(gameTime * 0.9), speed = 1.8 + Math.random() * 0.4, radius = 13, color = '#a855f7', expVal = 10, damage = 6;
      if (gameTime > 40 && Math.random() > 0.4) { type = 'zombie'; hp = 45 + Math.floor(gameTime * 1.5); speed = 1.35; radius = 16; color = '#22c55e'; expVal = 20; damage = 10; }
      if (gameTime > 90 && Math.random() > 0.7) { type = 'skeleton'; hp = 85 + Math.floor(gameTime * 2.3); speed = 1.6; radius = 15; color = '#e2e8f0'; expVal = 35; damage = 14; }
      enemies.push({ id: nextEnemyId++, type, x: ex, y: ey, radius, hp, maxHp: hp, speed, color, damage, expValue: expVal, flashTimer: 0, animTimer: Math.random() * 10 });
    }

    function addDamageNumber(x, y, text, color = '#ffffff') {
      damageNumbers.push({ id: nextDamageId++, x: x + (Math.random() - 0.5) * 16, y: y - 10, text, color, life: 0.85, maxLife: 0.85 });
    }
    function addParticles(x, y, color, count = 6) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, spd = 1.0 + Math.random() * 3.5;
        particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, color, radius: 2 + Math.random() * 3, life: 0.35 + Math.random() * 0.35, maxLife: 0.7 });
      }
    }

    const ALL_UPGRADES = [
      { id: 'magicMissile', title: '마법 화살 강화', desc: '화살 수 +1 및 공격력 25% 증가', icon: '🏹', level: () => player.weapons.magicMissile.level, apply: () => { player.weapons.magicMissile.level++; player.weapons.magicMissile.count++; player.weapons.magicMissile.damage = Math.round(player.weapons.magicMissile.damage * 1.25); } },
      { id: 'spinningAura', title: '회전 오라 강화', desc: '회전 오브 +1개 추가 및 속도/공격력 20% 증가', icon: '🌀', level: () => player.weapons.spinningAura.level, apply: () => { player.weapons.spinningAura.level++; player.weapons.spinningAura.count++; player.weapons.spinningAura.speed += 0.6; player.weapons.spinningAura.damage = Math.round(player.weapons.spinningAura.damage * 1.2); } },
      { id: 'might', title: '공격력 증폭', desc: '전체 공격력 +20% 증가', icon: '⚔️', level: () => Math.round((player.might - 1.0) / 0.2), apply: () => { player.might += 0.2; } },
      { id: 'speed', title: '이동속도 증가', desc: '플레이어 이동 속도 +15% 증가', icon: '👟', level: () => Math.round((player.speed - 3.3) / 0.5), apply: () => { player.speed += 0.5; } },
      { id: 'magnet', title: '자석 흡수 범위', desc: '보석 획득 흡수 범위 +45% 증가', icon: '🧲', level: () => Math.round((player.magnetRadius - 110) / 50), apply: () => { player.magnetRadius += 50; } },
      { id: 'vitality', title: '생명력 강화', desc: '최대 체력 +35 및 즉시 100% 회복', icon: '❤️', level: () => Math.round((player.maxHp - 100) / 35), apply: () => { player.maxHp += 35; player.hp = player.maxHp; } }
    ];

    function showLevelUpModal() {
      isLevelingUp = true; sound.playLevelUp(); cardsContainer.innerHTML = '';
      const choices = [...ALL_UPGRADES].sort(() => 0.5 - Math.random()).slice(0, 3);
      choices.forEach(upg => {
        const curLvl = upg.level();
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = '<div class="card-top"><div class="card-icon">' + upg.icon + '</div><div class="card-title-wrap"><div class="card-title">' + upg.title + '</div><div class="card-level">LV ' + curLvl + ' ➔ LV ' + (curLvl + 1) + '</div></div></div><div class="card-desc">' + upg.desc + '</div>';
        card.addEventListener('click', () => { upg.apply(); levelUpModal.style.display = 'none'; isLevelingUp = false; });
        cardsContainer.appendChild(card);
      });
      levelUpModal.style.display = 'flex';
    }

    function addExp(amount) {
      player.exp += amount;
      totalExpEarned += amount;
      if (player.exp >= player.nextExp) {
        player.exp -= player.nextExp; player.level++; player.nextExp = Math.floor(player.nextExp * 1.35 + 15);
        showLevelUpModal();
      }
      updateHud();
    }

    function updateHud() {
      hudLevel.textContent = player.level; hudKills.textContent = player.kills;
      const mins = Math.floor(gameTime / 60).toString().padStart(2, '0');
      const secs = Math.floor(gameTime % 60).toString().padStart(2, '0');
      hudTimer.textContent = mins + ':' + secs;
      const pct = Math.min(100, Math.floor((player.exp / player.nextExp) * 100));
      expFill.style.width = pct + '%'; expText.textContent = 'EXP ' + player.exp + ' / ' + player.nextExp + ' (' + pct + '%)';
    }

    let lastTime = performance.now();
    function update(dt) {
      if (isGameOver || isLevelingUp || isPaused) return;
      gameTime += dt; updateHud();

      if (gameTime >= 900 && !reaperSpawned) spawnReaper();

      spawnTimer += dt;
      if (spawnTimer >= (reaperSpawned ? 1.5 : Math.max(0.18, 1.0 - (gameTime / 180) * 0.75)) && enemies.length < 250) {
        spawnTimer = 0; spawnEnemy();
      }

      let dx = 0, dy = 0;
      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;
      const len = Math.hypot(dx, dy);
      if (len > 0.05) { player.x += (dx / len) * player.speed; player.y += (dy / len) * player.speed; player.walkCycle += dt * 10; if (dx !== 0) player.facing = dx > 0 ? 1 : -1; }
      if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;

      // 1. Magic Missile
      const mm = player.weapons.magicMissile; mm.timer += dt;
      if (mm.timer >= mm.cooldown * player.cooldownMult) {
        mm.timer = 0;
        const sorted = [...enemies].map(e => ({ enemy: e, dist: Math.hypot(e.x - player.x, e.y - player.y) })).sort((a, b) => a.dist - b.dist);
        const count = Math.min(mm.count, sorted.length);
        for (let i = 0; i < count; i++) {
          const t = sorted[i].enemy, a = Math.atan2(t.y - player.y, t.x - player.x);
          projectiles.push({ x: player.x, y: player.y, vx: Math.cos(a) * mm.speed, vy: Math.sin(a) * mm.speed, damage: mm.damage * player.might, radius: 8, pierce: mm.pierce, life: 2.3, color: '#38bdf8' });
        }
        if (count > 0) sound.playShoot();
      }

      // 2. Spinning Aura
      const sa = player.weapons.spinningAura; sa.angle += sa.speed * dt;

      // Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i]; p.x += p.vx; p.y += p.vy; p.life -= dt;
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
            if (e.isInvincible) {
              addDamageNumber(e.x, e.y, '무적', '#94a3b8');
            } else {
              e.hp -= p.damage; totalDamageDealt += p.damage; e.flashTimer = 0.12; addDamageNumber(e.x, e.y, Math.round(p.damage).toString()); addParticles(e.x, e.y, p.color, 4);
            }
            p.pierce--; if (p.pierce <= 0) { p.life = 0; break; }
          }
        }
        if (p.life <= 0) projectiles.splice(i, 1);
      }

      // Update Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]; e.animTimer += dt * 5; if (e.flashTimer > 0) e.flashTimer -= dt;
        const edx = player.x - e.x, edy = player.y - e.y, edist = Math.hypot(edx, edy);
        if (edist > 1) { e.x += (edx / edist) * e.speed; e.y += (edy / edist) * e.speed; }

        // Aura damage
        for (let a = 0; a < sa.count; a++) {
          const oa = sa.angle + (Math.PI * 2 / sa.count) * a;
          const ox = player.x + Math.cos(oa) * sa.radius, oy = player.y + Math.sin(oa) * sa.radius;
          if (Math.hypot(ox - e.x, oy - e.y) < sa.orbRadius + e.radius) {
            if (e.isInvincible) {
              if (Math.random() < 0.1) addDamageNumber(e.x, e.y, '무적', '#94a3b8');
            } else {
              const dmg = sa.damage * player.might * dt * 4;
              e.hp -= dmg; totalDamageDealt += dmg; e.flashTimer = 0.08;
              if (Math.random() < 0.2) { addDamageNumber(e.x, e.y, Math.round(sa.damage).toString()); sound.playAuraHit(); addParticles(ox, oy, '#facc15', 2); }
            }
          }
        }

        // Damage Player
        if (edist < player.radius + e.radius && player.invulnerableTimer <= 0) {
          player.hp -= e.damage;
          totalDamageTaken += e.damage;
          player.invulnerableTimer = e.isInvincible ? 0.05 : 0.4;
          addParticles(player.x, player.y, '#f43f5e', 8);

          if (e.isInvincible) {
            sound.playReaperSlash();
            deathCause = '무적의 사신(The Reaper)의 붉은 낫에 영혼을 거둠당함 (15분 타임오버)';
          } else {
            sound.playHurt();
            deathCause = '마물들의 끝없는 공세에 체력 고갈로 쓰러짐';
          }

          if (player.hp <= 0) {
            player.hp = 0; isGameOver = true;
            goTitle.textContent = gameTime >= 900 ? 'TIME EXPIRED' : 'GAME OVER';
            deathCauseBadge.textContent = '사망 원인: ' + deathCause;
            resTime.textContent = hudTimer.textContent;
            resLevel.textContent = 'LV ' + player.level;
            resKills.textContent = player.kills + ' 💀';
            resTotalExp.textContent = totalExpEarned.toLocaleString() + ' EXP';
            const pct = Math.floor((player.exp / player.nextExp) * 100);
            resCurrentExp.textContent = player.exp + ' / ' + player.nextExp + ' EXP (' + pct + '%)';
            resRemainExp.textContent = (player.nextExp - player.exp) + ' EXP';
            resDamageTaken.textContent = Math.round(totalDamageTaken).toLocaleString() + ' HP';
            resDamageDealt.textContent = Math.round(totalDamageDealt).toLocaleString() + ' DMG';
            gameOverModal.style.display = 'flex';
            return;
          }
        }

        // Death (Invincible cannot die)
        if (e.hp <= 0 && !e.isInvincible) {
          sound.playDeath(); player.kills++; addParticles(e.x, e.y, e.color, 10);
          dropItems.push({ id: nextItemId++, x: e.x, y: e.y, value: e.expValue, radius: 8, color: e.expValue > 25 ? '#22c55e' : '#38bdf8', isAttracted: false, speed: 1.0 });
          enemies.splice(i, 1);
        }
      }

      // Drop Items & Magnet
      for (let i = dropItems.length - 1; i >= 0; i--) {
        const it = dropItems[i]; const d = Math.hypot(player.x - it.x, player.y - it.y);
        if (d < player.magnetRadius) it.isAttracted = true;
        if (it.isAttracted) {
          const pa = Math.atan2(player.y - it.y, player.x - it.x);
          it.speed += dt * 32; it.x += Math.cos(pa) * it.speed; it.y += Math.sin(pa) * it.speed;
          if (d < player.radius + it.radius) { addExp(it.value); sound.playGem(); addParticles(it.x, it.y, it.color, 4); dropItems.splice(i, 1); }
        }
      }

      // Particles & Damage Numbers
      for (let i = particles.length - 1; i >= 0; i--) { particles[i].x += particles[i].vx; particles[i].y += particles[i].vy; particles[i].life -= dt; if (particles[i].life <= 0) particles.splice(i, 1); }
      for (let i = damageNumbers.length - 1; i >= 0; i--) { damageNumbers[i].y -= dt * 35; damageNumbers[i].life -= dt; if (damageNumbers[i].life <= 0) damageNumbers.splice(i, 1); }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      const camX = width / 2 - player.x, camY = height / 2 - player.y;
      ctx.save(); ctx.translate(camX, camY);

      // Floor
      const ts = 64, sx = Math.floor((player.x - width / 2) / ts) * ts, sy = Math.floor((player.y - height / 2) / ts) * ts;
      for (let x = sx; x < sx + width + ts * 2; x += ts) {
        for (let y = sy; y < sy + height + ts * 2; y += ts) {
          ctx.fillStyle = (Math.abs(Math.floor(x/ts)) + Math.abs(Math.floor(y/ts))) % 2 === 0 ? '#111420' : '#0d101a';
          ctx.fillRect(x, y, ts, ts); ctx.strokeStyle = '#181d2e'; ctx.lineWidth = 1; ctx.strokeRect(x, y, ts, ts);
        }
      }

      // Gems
      dropItems.forEach(it => {
        ctx.save(); ctx.translate(it.x, it.y); ctx.fillStyle = it.color; ctx.shadowColor = it.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(0, -it.radius); ctx.lineTo(it.radius * 0.8, 0); ctx.lineTo(0, it.radius); ctx.lineTo(-it.radius * 0.8, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      });

      // Projectiles
      projectiles.forEach(p => {
        ctx.save(); ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });

      // Enemies
      enemies.forEach(e => {
        ctx.save(); ctx.translate(e.x, e.y);
        ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : e.color;

        if (e.type === 'reaper') {
          ctx.shadowColor = '#dc2626'; ctx.shadowBlur = 24;
          ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(0, -6, e.radius * 0.75, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(-e.radius * 0.8, 8); ctx.lineTo(0, -e.radius * 1.1); ctx.lineTo(e.radius * 0.8, 8); ctx.lineTo(e.radius * 0.5, e.radius * 1.2); ctx.lineTo(-e.radius * 0.5, e.radius * 1.2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#f1f5f9'; ctx.beginPath(); ctx.arc(0, -8, e.radius * 0.45, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(-6, -9, 3, 0, Math.PI * 2); ctx.arc(6, -9, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(0, -e.radius * 1.5); ctx.quadraticCurveTo(e.radius * 1.6, -e.radius * 2.0, e.radius * 1.7, -e.radius * 0.8); ctx.quadraticCurveTo(e.radius * 1.1, -e.radius * 1.2, 0, -e.radius * 1.3); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('💀 사신 (무적 IMMUNE)', 0, -e.radius - 12);
        } else {
          ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill();
          if (!e.isInvincible) {
            const bw = e.radius * 2, hpPct = Math.max(0, e.hp / e.maxHp);
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-bw/2, -e.radius - 8, bw, 4);
            ctx.fillStyle = '#22c55e'; ctx.fillRect(-bw/2, -e.radius - 8, bw * hpPct, 4);
          }
        }
        ctx.restore();
      });

      // Player & Overhead HP Bar
      ctx.save(); ctx.translate(player.x, player.y);
      const bob = Math.sin(player.walkCycle) * 2;
      ctx.fillStyle = player.invulnerableTimer > 0 ? '#fda4af' : '#6366f1';
      ctx.beginPath(); ctx.arc(0, bob, player.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e0e7ff'; ctx.beginPath(); ctx.arc(0, bob - 2, player.radius * 0.55, 0, Math.PI * 2); ctx.fill();

      // Overhead HP Bar
      const pw = 40, phpPct = Math.max(0, player.hp / player.maxHp);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; ctx.fillRect(-pw/2, -player.radius - 16, pw, 5);
      ctx.fillStyle = phpPct > 0.3 ? '#22c55e' : '#ef4444'; ctx.fillRect(-pw/2, -player.radius - 16, pw * phpPct, 5);
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.strokeRect(-pw/2, -player.radius - 16, pw, 5);

      // Spinning Aura Orbs
      const sa = player.weapons.spinningAura;
      for (let a = 0; a < sa.count; a++) {
        const oa = sa.angle + (Math.PI * 2 / sa.count) * a;
        const ox = Math.cos(oa) * sa.radius, oy = Math.sin(oa) * sa.radius;
        ctx.save(); ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(ox, oy, sa.orbRadius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.restore();

      // Particles & Damage Numbers
      particles.forEach(p => { ctx.save(); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
      damageNumbers.forEach(dn => { ctx.save(); ctx.fillStyle = dn.color; ctx.font = 'bold 14px monospace'; ctx.fillText(dn.text, dn.x, dn.y); ctx.restore(); });

      ctx.restore();
    }

    function loop(t) {
      const dt = Math.min((t - lastTime) / 1000, 0.1); lastTime = t;
      update(dt); render(); requestAnimationFrame(loop);
    }
    initGame(); requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}
