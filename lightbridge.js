class LightBridge {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.cols = Math.floor(this.canvas.width / this.gridSize);
        this.rows = Math.floor(this.canvas.height / this.gridSize);
        this.difficulty = 'easy';
        this.level = 1;
        this.moves = 0;
        this.best = parseInt(localStorage.getItem('lightbridge_best') || '0');
        this.particles = [];
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        this.newGame();
    }

    generateLevel() {
        const levelData = {
            easy: [
                { emitters: [[2, 2]], targets: [[7, 7]], mirrors: [] },
                { emitters: [[1, 4]], targets: [[8, 4]], mirrors: [[4, 4]] },
                { emitters: [[2, 2]], targets: [[8, 8]], mirrors: [[5, 2], [8, 5]] }
            ],
            normal: [
                { emitters: [[1, 1], [8, 8]], targets: [[1, 8], [8, 1]], mirrors: [[4, 4], [5, 5]] },
                { emitters: [[4, 1]], targets: [[4, 9], [1, 4]], mirrors: [[4, 4], [1, 4]] }
            ],
            hard: [
                { emitters: [[1, 5]], targets: [[9, 5], [5, 9], [9, 1]], mirrors: [[3, 5], [5, 3], [7, 7]] }
            ]
        };

        const data = levelData[this.difficulty][(this.level - 1) % levelData[this.difficulty].length];
        
        this.emitters = data.emitters.map(([x, y]) => ({ x, y, angle: 0 }));
        this.targets = data.targets.map(([x, y]) => ({ x, y, hit: false }));
        this.mirrors = data.mirrors.map(([x, y]) => ({ x, y, angle: 0 }));
        
        this.moves = 0;
        this.updateUI();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.gridSize);
        const y = Math.floor((e.clientY - rect.top) / this.gridSize);

        for (let mirror of this.mirrors) {
            if (mirror.x === x && mirror.y === y) {
                mirror.angle = (mirror.angle + 45) % 360;
                this.moves++;
                this.updateUI();
                this.simulateLights();
                break;
            }
        }
    }

    simulateLights() {
        // Reset targets
        this.targets.forEach(t => t.hit = false);

        // Trace light from each emitter
        for (let emitter of this.emitters) {
            this.traceLight(emitter.x, emitter.y, 0);
        }

        this.draw();

        // Check win condition
        if (this.targets.every(t => t.hit)) {
            this.levelComplete();
        }
    }

    traceLight(x, y, angle, depth = 0) {
        if (depth > 10) return; // Prevent infinite loops

        const dx = Math.cos((angle * Math.PI) / 180);
        const dy = Math.sin((angle * Math.PI) / 180);
        const speed = 0.5;

        let px = x + 0.5;
        let py = y + 0.5;
        const startX = px;
        const startY = py;

        while (px >= 0 && px < this.cols && py >= 0 && py < this.rows) {
            px += dx * speed;
            py += dy * speed;

            // Check for mirror collision
            const gx = Math.floor(px);
            const gy = Math.floor(py);

            for (let mirror of this.mirrors) {
                if (mirror.x === gx && mirror.y === gy) {
                    // Reflect light
                    const newAngle = (angle + 2 * mirror.angle - 180) % 360;
                    this.traceLight(px, py, newAngle, depth + 1);
                    return;
                }
            }

            // Check for target hit
            for (let target of this.targets) {
                if (target.x === gx && target.y === gy) {
                    target.hit = true;
                    this.createParticles(px, py);
                    return;
                }
            }
        }
    }

    createParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x * this.gridSize,
                y: y * this.gridSize,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: '#ff6b9d'
            });
        }
    }

    levelComplete() {
        const score = this.level * 100 - this.moves;
        if (score > this.best) {
            this.best = score;
            localStorage.setItem('lightbridge_best', this.best);
        }
        setTimeout(() => {
            this.level++;
            this.newGame();
        }, 500);
    }

    newGame() {
        this.generateLevel();
        this.simulateLights();
    }

    reset() {
        this.newGame();
    }

    updateUI() {
        document.getElementById('levelNum').textContent = this.level;
        document.getElementById('movesNum').textContent = this.moves;
        document.getElementById('bestNum').textContent = this.best || '—';
    }

    draw() {
        // Clear
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw emitters (light sources)
        for (let emitter of this.emitters) {
            const x = (emitter.x + 0.5) * this.gridSize;
            const y = (emitter.y + 0.5) * this.gridSize;
            
            // Glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 35);
            gradient.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 35, y - 35, 70, 70);

            // Emitter circle
            this.ctx.fillStyle = '#ffc864';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⚡', x, y);
        }

        // Draw targets
        for (let target of this.targets) {
            const x = (target.x + 0.5) * this.gridSize;
            const y = (target.y + 0.5) * this.gridSize;

            // Glow effect
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 30);
            gradient.addColorStop(0, target.hit ? 'rgba(100, 255, 200, 0.4)' : 'rgba(255, 100, 200, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 100, 200, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 30, y - 30, 60, 60);

            this.ctx.strokeStyle = target.hit ? '#64ffcc' : '#ff6b9d';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.fillStyle = target.hit ? '#64ffcc' : '#ff6b9d';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('◉', x, y);
        }

        // Draw mirrors
        for (let mirror of this.mirrors) {
            const x = (mirror.x + 0.5) * this.gridSize;
            const y = (mirror.y + 0.5) * this.gridSize;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate((mirror.angle * Math.PI) / 180);

            this.ctx.strokeStyle = '#00bfff';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(-20, -5);
            this.ctx.lineTo(20, -5);
            this.ctx.lineTo(20, 5);
            this.ctx.lineTo(-20, 5);
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.fillStyle = 'rgba(0, 200, 255, 0.2)';
            this.ctx.fill();

            this.ctx.restore();
        }

        // Draw particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1; // gravity

            this.ctx.fillStyle = p.color.replace(')', `,${p.life})`).replace('rgb', 'rgba');
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();

            return p.life > 0;
        });
    }
}
