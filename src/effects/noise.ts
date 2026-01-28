document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById(
    "noise-canvas",
  ) as HTMLCanvasElement | null;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      initNoise(canvas, ctx);
    }
  }
});

function initNoise(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  let points: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    ox: number;
    oy: number;
  }[] = [];

  try {
    const spacing = 40;
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };
    let time = 0;

    const getNoiseColor = () => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--secondary-foreground")
        .trim();
    };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      points = [];
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          points.push({ x, y, vx: 0, vy: 0, ox: x, oy: y });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      ctx.fillStyle = getNoiseColor();

      time += 0.01;
      for (const [i, p] of points.entries()) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 300;

        if (dist < radius) {
          const angle = Math.atan2(dy, dx);
          const force = (radius - dist) / radius;
          p.vx += Math.cos(angle) * force * 0.5;
          p.vy += Math.sin(angle) * force * 0.5;
        }

        const ambientX = Math.sin(time + i * 0.1) * 0.3;
        const ambientY = Math.cos(time + i * 0.15) * 0.3;

        p.vx += (p.ox - p.x + ambientX) * 0.05;
        p.vy += (p.oy - p.y + ambientY) * 0.05;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
      }
    };

    init();
    animate();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", init);
  } catch (error) {}
}
