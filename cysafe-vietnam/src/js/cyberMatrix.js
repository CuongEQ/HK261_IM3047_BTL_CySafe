/**
 * CySafe Vietnam - Cyber Particle Network Canvas
 * Lightweight 60fps canvas animation representing national cyber-defense mesh
 * Zero dependencies, high performance, handles DPI scaling & resize
 */

export function initCyberMatrix(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  let animationId = null;
  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: -1000, y: -1000, radius: 140 };

  const PARTICLE_COUNT = Math.min(Math.floor(window.innerWidth / 25), 65);
  const CONNECTION_DIST = 130;

  function resize() {
    if (!canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.4 + 0.3;
      this.isHub = Math.random() < 0.15; // 15% special hub nodes (gold/cyan)
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulsePhase += 0.03;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse interactivity
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2;
        this.y -= (dy / dist) * force * 2;
      }
    }

    draw() {
      ctx.beginPath();
      const currentRadius = this.isHub 
        ? this.radius + Math.sin(this.pulsePhase) * 0.8 + 1
        : this.radius;

      ctx.arc(this.x, this.y, Math.max(currentRadius, 0.5), 0, Math.PI * 2);
      
      if (this.isHub) {
        ctx.fillStyle = `rgba(0, 242, 254, ${this.baseAlpha + 0.3})`;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(56, 189, 248, ${this.baseAlpha})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    ctx.lineWidth = 0.75;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();

          // Occasional data packet traveling
          if (particles[i].isHub && (i + j) % 3 === 0) {
            const progress = (Math.sin(particles[i].pulsePhase) + 1) / 2;
            const px = particles[i].x + (particles[j].x - particles[i].x) * progress;
            const py = particles[i].y + (particles[j].y - particles[i].y) * progress;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 4;
            ctx.fill();
          }
        }
      }

      // Connect to mouse if near
      const mdx = mouse.x - particles[i].x;
      const mdy = mouse.y - particles[i].y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < CONNECTION_DIST * 1.2) {
        const malpha = (1 - mdist / (CONNECTION_DIST * 1.2)) * 0.4;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 242, 254, ${malpha})`;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(loop);
  }

  // Event Listeners
  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const onMouseLeave = () => {
    mouse.x = -1000;
    mouse.y = -1000;
  };

  const onResize = () => {
    resize();
  };

  const parent = canvas.parentElement;
  if (parent) {
    parent.addEventListener('mousemove', onMouseMove);
    parent.addEventListener('mouseleave', onMouseLeave);
  }
  window.addEventListener('resize', onResize);

  init();
  loop();

  // Return teardown controller
  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
      if (parent) {
        parent.removeEventListener('mousemove', onMouseMove);
        parent.removeEventListener('mouseleave', onMouseLeave);
      }
      window.removeEventListener('resize', onResize);
    }
  };
}
