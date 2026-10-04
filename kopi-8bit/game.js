// 8-Bit Mini-Game: "Pixel Coffee Bean Catcher"
// Tangkap biji kopi untuk memenangkan voucher diskon!

class CoffeeCatcherGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.isRunning = false;
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 25;
    this.timerInterval = null;
    this.items = [];
    this.itemSpawnTimer = 0;
    this.voucherEarned = null;

    // Cup player
    this.player = {
      x: 160,
      y: 220,
      width: 44,
      height: 36,
      speed: 6,
      movingLeft: false,
      movingRight: false
    };

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.movingLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.movingRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.movingLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.movingRight = false;
      }
    });

    // Touch controls for mobile
    const leftBtn = document.getElementById('game-btn-left');
    const rightBtn = document.getElementById('game-btn-right');

    if (leftBtn) {
      leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.player.movingLeft = true; });
      leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.player.movingLeft = false; });
      leftBtn.addEventListener('mousedown', () => { this.player.movingLeft = true; });
      leftBtn.addEventListener('mouseup', () => { this.player.movingLeft = false; });
    }
    if (rightBtn) {
      rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.player.movingRight = true; });
      rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.player.movingRight = false; });
      rightBtn.addEventListener('mousedown', () => { this.player.movingRight = true; });
      rightBtn.addEventListener('mouseup', () => { this.player.movingRight = false; });
    }
  }

  start() {
    if (!this.canvas) {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
    }
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 25;
    this.items = [];
    this.isRunning = true;
    this.voucherEarned = null;
    this.player.x = (this.canvas.width / 2) - 22;

    this.updateHUD();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning) return;
      this.timeLeft--;
      this.updateHUD();
      if (this.timeLeft <= 0) {
        this.endGame(true);
      }
    }, 1000);

    if (window.soundSystem) {
      window.soundSystem.playStartSound();
    }

    requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateHUD() {
    const scoreEl = document.getElementById('game-score-display');
    const timeEl = document.getElementById('game-time-display');
    const livesEl = document.getElementById('game-lives-display');

    if (scoreEl) scoreEl.textContent = this.score;
    if (timeEl) timeEl.textContent = this.timeLeft + 's';
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }
  }

  spawnItem() {
    const types = [
      { type: 'bean', color: '#6F4E37', points: 10, speed: 2.2, icon: '☕' },
      { type: 'golden_bean', color: '#FFD700', points: 25, speed: 3.2, icon: '⭐' },
      { type: 'milk', color: '#FFF8DC', points: 15, speed: 2.0, icon: '🥛' },
      { type: 'glitch', color: '#E53E3E', points: -15, isHazard: true, speed: 2.6, icon: '👾' }
    ];

    const rand = Math.random();
    let selected;
    if (rand < 0.55) selected = types[0];
    else if (rand < 0.75) selected = types[1];
    else if (rand < 0.90) selected = types[2];
    else selected = types[3];

    this.items.push({
      x: 15 + Math.random() * (this.canvas.width - 50),
      y: -20,
      width: 22,
      height: 22,
      ...selected
    });
  }

  loop() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw retro grid background
    this.ctx.fillStyle = '#110C1B';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Pixel stars/dots
    this.ctx.fillStyle = '#301B3F';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 27 + (this.timeLeft * 3)) % this.canvas.width;
      const sy = (i * 19) % this.canvas.height;
      this.ctx.fillRect(sx, sy, 3, 3);
    }

    // Move player
    if (this.player.movingLeft && this.player.x > 5) {
      this.player.x -= this.player.speed;
    }
    if (this.player.movingRight && this.player.x < this.canvas.width - this.player.width - 5) {
      this.player.x += this.player.speed;
    }

    // Draw Pixel Coffee Mug Player
    this.drawPixelCup(this.player.x, this.player.y);

    // Spawn items
    this.itemSpawnTimer++;
    if (this.itemSpawnTimer > 35) {
      this.spawnItem();
      this.itemSpawnTimer = 0;
    }

    // Update & draw items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;

      // Draw item
      this.drawItem(item);

      // Check collision with player
      if (
        item.x < this.player.x + this.player.width &&
        item.x + item.width > this.player.x &&
        item.y < this.player.y + this.player.height &&
        item.y + item.height > this.player.y
      ) {
        // Hit!
        if (item.isHazard) {
          this.lives--;
          if (window.soundSystem) window.soundSystem.playGameOverSound();
          if (this.lives <= 0) {
            this.endGame(false);
            return;
          }
        } else {
          this.score += item.points;
          if (window.soundSystem) {
            if (item.type === 'golden_bean') window.soundSystem.playPowerupSound();
            else window.soundSystem.playCoinSound();
          }
        }
        this.updateHUD();
        this.items.splice(i, 1);
        continue;
      }

      // Out of bounds
      if (item.y > this.canvas.height) {
        this.items.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.loop());
  }

  drawPixelCup(x, y) {
    const ctx = this.ctx;
    // Cup body
    ctx.fillStyle = '#E2B887';
    ctx.fillRect(x + 4, y + 6, 32, 26);

    // Inner coffee
    ctx.fillStyle = '#4A2E18';
    ctx.fillRect(x + 6, y + 8, 28, 6);

    // Cup handle
    ctx.fillStyle = '#D4A373';
    ctx.fillRect(x + 36, y + 10, 8, 16);
    ctx.fillStyle = '#110C1B';
    ctx.fillRect(x + 38, y + 14, 4, 8);

    // Steam pixels
    ctx.fillStyle = '#FFFFFF';
    const steamOffset = (Date.now() / 150) % 6;
    ctx.fillRect(x + 12, y - steamOffset, 4, 4);
    ctx.fillRect(x + 22, y - 4 - steamOffset, 4, 4);

    // Pixel face on cup
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 12, y + 18, 4, 4);
    ctx.fillRect(x + 24, y + 18, 4, 4);
    ctx.fillRect(x + 16, y + 24, 8, 3);
  }

  drawItem(item) {
    const ctx = this.ctx;
    if (item.type === 'bean' || item.type === 'golden_bean') {
      ctx.fillStyle = item.color;
      ctx.fillRect(item.x + 2, item.y, 14, 16);
      ctx.fillStyle = '#2B1704';
      ctx.fillRect(item.x + 7, item.y + 2, 4, 12);
    } else if (item.type === 'milk') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(item.x + 4, item.y + 4, 14, 16);
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(item.x + 6, item.y, 10, 4);
    } else {
      // Glitch / Hazard
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(item.x + 2, item.y + 2, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(item.x + 6, item.y + 6, 3, 3);
      ctx.fillRect(item.x + 11, item.y + 6, 3, 3);
      ctx.fillRect(item.x + 6, item.y + 12, 8, 2);
    }
  }

  endGame(completed) {
    this.stop();
    if (window.soundSystem) {
      if (completed && this.score >= 50) window.soundSystem.playPowerupSound();
      else window.soundSystem.playGameOverSound();
    }

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const desc = document.getElementById('game-over-desc');
    const voucherBox = document.getElementById('game-voucher-box');

    if (this.score >= 100) {
      this.voucherEarned = { code: 'BOSSBEANS20', discount: 20 };
      title.textContent = '🏆 LEVEL MASTER! SCORE: ' + this.score;
      desc.textContent = 'Hebat banget! Kamu dapat Voucher Diskon 20%!';
      voucherBox.innerHTML = `
        <div class="voucher-card">
          <p>KODE VOUCHER:</p>
          <div class="voucher-code" onclick="applyGameVoucher('BOSSBEANS20')">BOSSBEANS20 <span class="click-copy">[KLIK PASANG]</span></div>
          <p class="voucher-sub">Diskon 20% untuk semua menu kopi!</p>
        </div>
      `;
    } else if (this.score >= 50) {
      this.voucherEarned = { code: 'PIXEL10', discount: 10 };
      title.textContent = '⭐ GG! SCORE: ' + this.score;
      desc.textContent = 'Mantap! Kamu dapat Voucher Diskon 10%!';
      voucherBox.innerHTML = `
        <div class="voucher-card">
          <p>KODE VOUCHER:</p>
          <div class="voucher-code" onclick="applyGameVoucher('PIXEL10')">PIXEL10 <span class="click-copy">[KLIK PASANG]</span></div>
          <p class="voucher-sub">Diskon 10% pesanan kopimu hari ini!</p>
        </div>
      `;
    } else {
      title.textContent = 'GAME OVER! SCORE: ' + this.score;
      desc.textContent = 'Belum mencapai 50 poin untuk voucher. Mau coba main lagi?';
      voucherBox.innerHTML = `
        <p style="color: var(--pixel-gold);">Target: Kumpulkan minimal 50 poin!</p>
      `;
    }

    if (modal) modal.classList.remove('hidden');
  }
}

window.coffeeGame = new CoffeeCatcherGame();
