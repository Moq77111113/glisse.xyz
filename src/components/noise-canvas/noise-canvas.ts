export class GlisseNoiseCanvas extends HTMLElement {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private points: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    ox: number;
    oy: number;
  }> = [];
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  private time = 0;

  connectedCallback(): void {
    this.render();
    this.initNoise();
  }

  disconnectedCallback(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("resize", this.init);
  }

  private render(): void {
    this.canvas = document.createElement("canvas");
    this.canvas.className =
      "fixed top-0 left-0 w-full h-full -z-10 pointer-events-none";
    this.appendChild(this.canvas);
  }

  private initNoise(): void {
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.init();
    this.animateFrame();
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove, {
      passive: true,
    });
    window.addEventListener("resize", this.init);
  }

  private init = (): void => {
    if (!this.canvas) return;

    const spacing = 40;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.points = [];

    for (let x = 0; x < this.canvas.width; x += spacing) {
      for (let y = 0; y < this.canvas.height; y += spacing) {
        this.points.push({ x, y, vx: 0, vy: 0, ox: x, oy: y });
      }
    }
  };

  private animateFrame = (): void => {
    if (!this.canvas || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    const noiseColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--secondary-foreground")
      .trim();
    this.ctx.fillStyle = noiseColor;

    this.time += 0.01;

    for (const [i, p] of this.points.entries()) {
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 300;

      if (dist < radius) {
        const angle = Math.atan2(dy, dx);
        const force = (radius - dist) / radius;
        p.vx += Math.cos(angle) * force * 0.5;
        p.vy += Math.sin(angle) * force * 0.5;
      }

      const ambientX = Math.sin(this.time + i * 0.1) * 0.3;
      const ambientY = Math.cos(this.time + i * 0.15) * 0.3;

      p.vx += (p.ox - p.x + ambientX) * 0.05;
      p.vy += (p.oy - p.y + ambientY) * 0.05;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += p.vx;
      p.y += p.vy;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.animateFrame);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    this.targetMouse.x = e.clientX;
    this.targetMouse.y = e.clientY;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.targetMouse.x = e.touches[0].clientX;
      this.targetMouse.y = e.touches[0].clientY;
    }
  };
}

customElements.define("glisse-noise-canvas", GlisseNoiseCanvas);
