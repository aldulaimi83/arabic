// VOID STRIKER - Physics-based Spaceship Fling Shooter
class VoidStriker {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;

        this.score = 0;
        this.level = 1;
        this.bestScore = parseInt(localStorage.getItem('voidstriker_best') || '0');

        this.ship = null;
        this.targets = [];
        this.particles = [];
        this.trails = [];

        this.isDragging = false;
        this.dragStart = null;
        this.launcherX = 50;
        this.launcherY = this.gameHeight - 50;
        this.launcherRadius = 20;

        this.gameState = 'playing'; // playing, levelComplete, gameOver
        this.levelTargetsDestroyed = 0;

        this.setupEventListeners();
        this.generateLevel();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    generateLevel() {
        const targetCount = Math.min(3 + Math.floor(this.level / 2), 8);
        this.targets = [];

        for (let i = 0; i < targetCount; i++) {
            let x, y, overlapping;
            do {
                overlapping = false;
                x = 150 + Math.random() * (this.gameWidth - 250);
                y = 80 + Math.random() * (this.gameHeight - 200);

                for (let t of this.targets) {
                    const dist = Math.hypot(x - t.x, y - t.y);
                    if (dist < 100) overlapping = true;
                }
            } while (overlapping);

            this.targets.push({
                x, y,
                radius: 15,
                health: 1 + Math.floor(this.level / 3),
                maxHealth: 1 + Math.floor(this.level / 3),
                color: this.getRandomColor()
            });
        }

        this.levelTargetsDestroyed = 0;
        this.ship = null;
    }

    getRandomColor() {
        const colors = ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00', '#FF0099', '#00FFB3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.gameWidth / rect.width);
        const y = (e.clientY - rect.top) * (this.gameHeight / rect.height);

        const dist = Math.hypot(x - this.launcherX, y - this.launcherY);
        if (dist < this.launcherRadius * 2) {
            this.isDragging = true;
            this.dragStart = { x, y };
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.gameWidth / rect.width);
        const y = (e.clientY - rect.top) * (this.gameHeight / rect.height);
        this.dragStart = { x, y };
    }

    handleMouseUp(e) {
        if (this.isDragging && this.dragStart) {
            this.launchShip();
        }
        this.isDragging = false;
    }

    handleTouchStart(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (this.gameWidth / rect.width);
        const y = (touch.clientY - rect.top) * (this.gameHeight / rect.height);

        const dist = Math.hypot(x - this.launcherX, y - this.launcherY);
        if (dist < this.launcherRadius * 2) {
            this.isDragging = true;
            this.dragStart = { x, y };
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (this.gameWidth / rect.width);
        const y = (touch.clientY - rect.top) * (this.gameHeight / rect.height);
        this.dragStart = { x, y };
    }

    handleTouchEnd(e) {
        if (this.isDragging && this.dragStart) {
            this.launchShip();
        }
        this.isDragging = false;
    }

    launchShip() {
        if (this.ship || !this.dragStart) return;

        const dx = this.launcherX - this.dragStart.x;
        const dy = this.launcherY - this.dragStart.y;
        const force = Math.min(Math.hypot(dx, dy), 300);

        const angle = Math.atan2(dy, dx);
        const vx = Math.cos(angle) * force * 0.1;
        const vy = Math.sin(angle) * force * 0.1;

        this.ship = {
            x: this.launcherX,
            y: this.launcherY,
            vx, vy,
            radius: 10,
            color: '#00FFFF',
            active: true
        };

        this.playLaunchSound();
    }

    update() {
        if (this.gameState !== 'playing') return;

        if (this.ship && this.ship.active) {
            // Physics
            this.ship.vy += 0.3; // gravity
            this.ship.x += this.ship.vx;
            this.ship.y += this.ship.vy;

            // Trail
            this.trails.push({
                x: this.ship.x,
                y: this.ship.y,
                life: 1,
                radius: 5
            });

            // Wall collision
            if (this.ship.x - this.ship.radius < 0 || this.ship.x + this.ship.radius > this.gameWidth) {
                this.ship.vx *= -0.8;
                this.ship.x = Math.max(this.ship.radius, Math.min(this.gameWidth - this.ship.radius, this.ship.x));
            }
            if (this.ship.y - this.ship.radius < 0 || this.ship.y + this.ship.radius > this.gameHeight) {
                this.ship.vy *= -0.8;
                this.ship.y = Math.max(this.ship.radius, Math.min(this.gameHeight - this.ship.radius, this.ship.y));
            }

            // Target collision
            for (let target of this.targets) {
                const dist = Math.hypot(this.ship.x - target.x, this.ship.y - target.y);
                if (dist < this.ship.radius + target.radius) {
                    target.health--;
                    this.createParticles(this.ship.x, this.ship.y, target.color, 8);
                    this.playHitSound(target.health > 0 ? 'hit' : 'destroy');

                    if (target.health <= 0) {
                        const points = 100 * (this.level + 1);
                        this.score += points;
                        this.levelTargetsDestroyed++;
                        this.createParticles(target.x, target.y, target.color, 15);
                    }

                    this.ship.vx *= -0.7;
                    this.ship.vy *= -0.7;
                }
            }

            // Remove dead ship
            if (Math.hypot(this.ship.vx, this.ship.vy) < 0.5 &&
                (this.ship.y > this.gameHeight - 100 || this.ship.x < 100)) {
                this.ship.active = false;
            }
        }

        // Update trails
        this.trails = this.trails.filter(t => {
            t.life -= 0.02;
            return t.life > 0;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.03;
            return p.life > 0;
        });

        // Check level complete
        if (this.levelTargetsDestroyed === this.targets.length) {
            this.levelUp();
        }

        this.updateUI();
    }

    levelUp() {
        this.gameState = 'levelComplete';
        this.playLevelCompleteSound();

        setTimeout(() => {
            this.level++;
            this.generateLevel();
            this.gameState = 'playing';
        }, 1500);
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 1,
                radius: 2 + Math.random() * 2
            });
        }
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('levelDisplay').textContent = this.level;
        document.getElementById('bestDisplay').textContent = this.bestScore;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.gameWidth; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.gameHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.gameHeight; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.gameWidth, y);
            this.ctx.stroke();
        }

        // Draw targets
        this.targets.forEach(target => {
            if (target.health > 0) {
                const healthPercent = target.health / target.maxHealth;

                // Glow
                this.ctx.shadowColor = target.color;
                this.ctx.shadowBlur = 20;

                // Health bar background
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(target.x - 30, target.y - 35, 60, 6);

                // Health bar
                this.ctx.fillStyle = target.color;
                this.ctx.fillRect(target.x - 30, target.y - 35, 60 * healthPercent, 6);

                // Target circle
                this.ctx.fillStyle = target.color;
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Inner circle
                this.ctx.fillStyle = '#0a0e27';
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, target.radius * 0.5, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.shadowBlur = 0;
            }
        });

        // Draw launcher
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.shadowColor = '#00FFFF';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(this.launcherX, this.launcherY, this.launcherRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw aim line
        if (this.isDragging && this.dragStart) {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.launcherX, this.launcherY);
            this.ctx.lineTo(this.dragStart.x, this.dragStart.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Power indicator
            const power = Math.hypot(
                this.launcherX - this.dragStart.x,
                this.launcherY - this.dragStart.y
            );
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.fillRect(this.launcherX - 40, this.launcherY + 40, Math.min(power / 2, 80), 8);
        }

        // Draw trails
        this.trails.forEach(trail => {
            this.ctx.fillStyle = `rgba(0, 255, 255, ${trail.life * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw ship
        if (this.ship && this.ship.active) {
            this.ctx.fillStyle = this.ship.color;
            this.ctx.shadowColor = this.ship.color;
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(this.ship.x, this.ship.y, this.ship.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        });

        // Level complete text
        if (this.gameState === 'levelComplete') {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.font = 'bold 48px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('LEVEL COMPLETE!', this.gameWidth / 2, this.gameHeight / 2);
        }
    }

    // Sound generation
    playLaunchSound() {
        this.playBeep(400, 100, 0.1);
    }

    playHitSound(type) {
        if (type === 'hit') {
            this.playBeep(600, 80, 0.08);
        } else {
            this.playBeep(800, 150, 0.1);
            this.playBeep(400, 100, 0.08, 100);
        }
    }

    playLevelCompleteSound() {
        this.playBeep(523, 100, 0.1);
        this.playBeep(659, 100, 0.1, 150);
        this.playBeep(784, 200, 0.1, 300);
    }

    playBeep(freq, duration, volume, delay = 0) {
        try {
            const audioContext = window.audioContext || (window.audioContext = new (window.AudioContext || window.webkitAudioContext)());
            const now = audioContext.currentTime + delay / 1000;

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioContext.destination);

            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) {
            // Audio not supported
        }
    }

    newGame() {
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing';
        this.generateLevel();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game
function startGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        setTimeout(startGame, 100);
        return;
    }

    window.game = new VoidStriker('gameCanvas');
    window.game.gameLoop();

    document.getElementById('newGameBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
        window.game.newGame();
    });

    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
        window.game.newGame();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
