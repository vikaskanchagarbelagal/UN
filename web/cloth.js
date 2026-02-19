class Cloth {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.section = canvas.parentElement;
    this.mouse = { x: -9999, y: -9999, radius: 100 };
    this.hoverSlow = false;
    this.gravity = 0;
    this.iterations = 2;
    this.spacing = 6; // smaller spacing = smaller boxes
    this.points = [];
    this.sticks = [];
    this.baseRgb = [227, 215, 193];

    this.setCanvasSize();
    this.createCloth();
    this.addListeners();
    this.update();
  }

  setCanvasSize() {
    const rect = this.section.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = this.w * ratio;
    this.canvas.height = this.h * ratio;
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.cols = Math.ceil(this.w / this.spacing);
    this.rows = Math.ceil(this.h / this.spacing);
  }

  addListeners() {
    window.addEventListener("mousemove", e => this.setMouse(e.clientX, e.clientY));
    window.addEventListener("touchstart", e => {
      if (e.touches.length) this.setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("touchmove", e => {
      if (e.touches.length) this.setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("mouseleave", () => { this.mouse.x = -9999; this.mouse.y = -9999; });
    window.addEventListener("resize", () => { this.setCanvasSize(); this.createCloth(); });
  }

  setMouse(x, y) {
    const rect = this.section.getBoundingClientRect();
    this.mouse.x = x - rect.left;
    this.mouse.y = y - rect.top;
    this.hoverSlow = true;
    clearTimeout(window.hoverTimeout);
    window.hoverTimeout = setTimeout(() => this.hoverSlow = false, 100);
  }

  createCloth() {
    this.points = [];
    this.sticks = [];
    for (let y = 0; y <= this.rows; y++) {
      for (let x = 0; x <= this.cols; x++) {
        const px = x * this.spacing;
        const py = y * this.spacing;
        const pinned = (y === 0 || y === this.rows || x === 0 || x === this.cols);
        this.points.push(new Point(px, py, pinned, this));
      }
    }
    for (let y = 0; y <= this.rows; y++) {
      for (let x = 0; x <= this.cols; x++) {
        const i = y * (this.cols + 1) + x;
        if (x < this.cols) this.sticks.push(new Stick(this.points[i], this.points[i + 1], this));
        if (y < this.rows) this.sticks.push(new Stick(this.points[i], this.points[i + this.cols + 1], this));
      }
    }
  }

  drawBackground() {
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, "#f2e7d5");
    grad.addColorStop(1, "#d8c2a6");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  update() {
    this.drawBackground();

    // Update only points near mouse (radius + buffer)
    const radiusSq = this.mouse.radius * this.mouse.radius * 1.5;
    this.points.forEach(p => {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      if (dx*dx + dy*dy < radiusSq || this.mouse.x < 0) p.update();
    });

    for (let i = 0; i < this.iterations; i++) this.sticks.forEach(s => s.resolve());
    this.sticks.forEach(s => s.draw());

    requestAnimationFrame(() => this.update());
  }
}

class Point {
  constructor(x, y, pinned, cloth) {
    Object.assign(this, { x, y, oldx: x, oldy: y, pinned, cloth });
  }
  update() {
    if (this.pinned) return;
    const c = this.cloth;
    const damping = c.hoverSlow ? 0.93 : 0.975;
    const vx = (this.x - this.oldx) * damping;
    const vy = (this.y - this.oldy) * damping;
    this.oldx = this.x; this.oldy = this.y;
    this.x += vx;
    this.y += vy + c.gravity;

    const dx = this.x - c.mouse.x;
    const dy = this.y - c.mouse.y;
    const distSq = dx*dx + dy*dy;
    if (distSq < c.mouse.radius*c.mouse.radius) {
      const dist = Math.sqrt(distSq) || 1;
      const mag = (c.mouse.radius - dist) * 0.35;
      this.x -= (dx / dist) * mag;
      this.y -= (dy / dist) * mag;
    }
  }
}

class Stick {
  constructor(p1, p2, cloth) {
    Object.assign(this, { p1, p2, cloth, length: cloth.spacing });
    this.distortion = 0;
  }
  resolve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const diff = (this.length - dist)/dist*0.5;
    if (!this.p1.pinned) { this.p1.x -= dx*diff; this.p1.y -= dy*diff; }
    if (!this.p2.pinned) { this.p2.x += dx*diff; this.p2.y += dy*diff; }
    this.distortion = Math.abs(dist - this.length);
  }
  draw() {
    const c = this.cloth;
    const reflect = Math.min(this.distortion*2,1);
    const r = c.baseRgb[0]+14*reflect;
    const g = c.baseRgb[1]+14*reflect;
    const b = c.baseRgb[2]+14*reflect;
    c.ctx.beginPath();
    c.ctx.moveTo(this.p1.x,this.p1.y);
    c.ctx.lineTo(this.p2.x,this.p2.y);
    c.ctx.strokeStyle = `rgb(${r|0},${g|0},${b|0})`;
    c.ctx.lineWidth = 1.5; // thin threads
    c.ctx.stroke();
  }
}

// Initialize all canvases
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cloth-canvas").forEach(c => new Cloth(c));
});
