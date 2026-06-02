(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth <= 768;

  const PALETTE = ["#b600a8", "#7621b0", "#be4c00", "#bbccd7", "#ffffff"];

  /* ═══ Section canvas backgrounds (unique per section) ═══ */
  const sections = [
    { el: document.querySelector(".about"), mode: "about" },
    { el: document.querySelector(".services"), mode: "services" },
    { el: document.querySelector(".projects"), mode: "projects" },
    { el: document.querySelector(".contact"), mode: "contact" },
  ].filter((s) => s.el);

  sections.forEach((s) => {
    s.canvas = s.el.querySelector(".section-fx-canvas");
    s.ctx = s.canvas ? s.canvas.getContext("2d", { alpha: true }) : null;
    s.w = 0;
    s.h = 0;
    s.active = false;
    s.items = [];
    s.mouse = { x: 0.5, y: 0.5 };
    s.time = 0;
  });

  let rafId = null;

  function resizeSection(s) {
    if (!s.canvas || !s.ctx) return;
    const rect = s.el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    s.w = Math.max(rect.width, 1);
    s.h = Math.max(rect.height, 1);
    s.canvas.width = s.w * dpr;
    s.canvas.height = s.h * dpr;
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initSectionState(s);
  }

  function initSectionState(s) {
    const w = s.w;
    const h = s.h;
    s.items = [];

    if (s.mode === "about") {
      const n = isMobile ? 14 : 24;
      for (let i = 0; i < n; i++) {
        s.items.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 80 + 40,
          phase: Math.random() * Math.PI * 2,
          speed: 0.003 + Math.random() * 0.004,
          hue: Math.random() > 0.5 ? "118, 33, 176" : "182, 0, 168",
        });
      }
    }

    if (s.mode === "services") {
      const cols = isMobile ? 8 : 14;
      const colW = w / cols;
      for (let c = 0; c < cols; c++) {
        s.items.push({
          x: c * colW + colW / 2,
          y: Math.random() * h,
          speed: 1 + Math.random() * 2,
          chars: "01",
          opacity: Math.random() * 0.35 + 0.1,
        });
      }
    }

    if (s.mode === "projects") {
      const n = isMobile ? 16 : 30;
      for (let i = 0; i < n; i++) {
        s.items.push({
          angle: (i / n) * Math.PI * 2,
          dist: 0.2 + Math.random() * 0.35,
          speed: 0.002 + Math.random() * 0.003,
          len: 20 + Math.random() * 60,
        });
      }
    }

    if (s.mode === "contact") {
      const n = isMobile ? 35 : 70;
      for (let i = 0; i < n; i++) {
        s.items.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 1.5 + 0.4,
          trail: [],
        });
      }
    }
  }

  /* About: soft bokeh orbs + rising sparks */
  function drawAbout(s) {
    const { ctx, w, h, items, mouse, time } = s;
    ctx.clearRect(0, 0, w, h);
    const mx = mouse.x * w;
    const my = mouse.y * h;

    items.forEach((b) => {
      b.phase += b.speed;
      const ox = Math.sin(b.phase) * 30;
      const oy = Math.cos(b.phase * 0.7) * 20;
      const cx = b.x + ox + (mx - b.x) * 0.02;
      const cy = b.y + oy + (my - b.y) * 0.02;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
      g.addColorStop(0, `rgba(${b.hue}, 0.14)`);
      g.addColorStop(0.5, `rgba(${b.hue}, 0.05)`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    const sparks = 12;
    for (let i = 0; i < sparks; i++) {
      const t = (time * 0.0003 + i / sparks) % 1;
      const sx = (i * 97 + time * 0.02) % w;
      const sy = h - t * h * 1.1;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(187, 204, 215, ${0.15 + (1 - t) * 0.35})`;
      ctx.fill();
    }
  }

  /* Services: gentle data columns */
  function drawServices(s) {
    const { ctx, w, h, items, mouse } = s;
    ctx.clearRect(0, 0, w, h);
    const mx = mouse.x * w;
    const my = mouse.y * h;

    items.forEach((col) => {
      col.y -= col.speed;
      if (col.y < -20) col.y = h + 20;
      const dx = mx - col.x;
      const dy = my - col.y;
      const near = Math.hypot(dx, dy) < 120;
      ctx.font = "10px monospace";
      ctx.fillStyle = near
        ? `rgba(0, 180, 216, ${col.opacity + 0.3})`
        : `rgba(118, 33, 176, ${col.opacity})`;
      const ch = Math.random() > 0.5 ? "1" : "0";
      ctx.fillText(ch, col.x, col.y);
      if (near && Math.random() > 0.92) {
        ctx.fillStyle = "rgba(182, 0, 168, 0.5)";
        ctx.fillRect(col.x - 1, col.y - 8, 2, 12);
      }
    });
  }

  /* Projects: orbital data arcs */
  function drawProjects(s) {
    const { ctx, w, h, items, mouse, time } = s;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5 + (mouse.x - 0.5) * 30;
    const cy = h * 0.45 + (mouse.y - 0.5) * 20;
    const maxR = Math.min(w, h) * 0.48;

    items.forEach((arc) => {
      arc.angle += arc.speed;
      const r = arc.dist * maxR;
      const x1 = cx + Math.cos(arc.angle) * r;
      const y1 = cy + Math.sin(arc.angle) * r;
      const x2 = cx + Math.cos(arc.angle) * (r + arc.len);
      const y2 = cy + Math.sin(arc.angle) * (r + arc.len);
      ctx.strokeStyle = `rgba(182, 0, 168, ${0.12 + Math.sin(time * 0.002 + arc.angle) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    ctx.strokeStyle = "rgba(187, 204, 215, 0.04)";
    ctx.lineWidth = 0.5;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2 + time * 0.0002;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * maxR, cy + Math.sin(ang) * maxR);
      ctx.stroke();
    }
  }

  /* Contact: shooting stars with trails */
  function drawContact(s) {
    const { ctx, w, h, items, mouse } = s;
    ctx.clearRect(0, 0, w, h);
    const mx = mouse.x * w;
    const my = mouse.y * h;

    items.forEach((st) => {
      const dx = mx - st.x;
      const dy = my - st.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 0) {
        st.vx += (dx / dist) * 0.03;
        st.vy += (dy / dist) * 0.03;
      }
      st.vx *= 0.99;
      st.vy *= 0.99;
      st.x += st.vx;
      st.y += st.vy;
      if (st.x < 0) st.x = w;
      if (st.x > w) st.x = 0;
      if (st.y < 0) st.y = h;
      if (st.y > h) st.y = 0;

      st.trail.push({ x: st.x, y: st.y });
      if (st.trail.length > 6) st.trail.shift();

      for (let i = 1; i < st.trail.length; i++) {
        const a = i / st.trail.length;
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.15})`;
        ctx.lineWidth = st.size * a;
        ctx.beginPath();
        ctx.moveTo(st.trail[i - 1].x, st.trail[i - 1].y);
        ctx.lineTo(st.trail[i].x, st.trail[i].y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
      ctx.fillStyle = dist < 120 ? "rgba(255,255,255,0.9)" : "rgba(187, 204, 215, 0.6)";
      ctx.fill();
    });
  }

  const drawers = {
    about: drawAbout,
    services: drawServices,
    projects: drawProjects,
    contact: drawContact,
  };

  // Mobile scroll jank fix: throttle expensive canvas redraws.
  const MOBILE_FRAME_INTERVAL_MS = isMobile ? 50 : 0; // ~20fps
  let lastCanvasDrawAt = 0;

  function loop(now) {
    let anyActive = false;

    sections.forEach((s) => {
      if (!s.active || !s.ctx || prefersReducedMotion) return;
      anyActive = true;
    });

    if (!anyActive) {
      rafId = null;
      return;
    }

    if (MOBILE_FRAME_INTERVAL_MS) {
      if (now - lastCanvasDrawAt < MOBILE_FRAME_INTERVAL_MS) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      lastCanvasDrawAt = now;
    }

    sections.forEach((s) => {
      if (!s.active || !s.ctx || prefersReducedMotion) return;
      s.time = now;
      drawers[s.mode](s);
    });

    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId && !prefersReducedMotion) rafId = requestAnimationFrame(loop);
  }

  function stopLoopIfIdle() {
    if (!sections.some((s) => s.active)) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const s = sections.find((x) => x.el === e.target);
          if (!s) return;
          s.active = e.isIntersecting;
          if (e.isIntersecting) {
            resizeSection(s);
            startLoop();
          } else stopLoopIfIdle();
        });
      },
      { threshold: 0.05, rootMargin: "60px 0px" }
    );
    sections.forEach((s) => io.observe(s.el));
  } else {
    sections.forEach((s) => {
      s.active = true;
      resizeSection(s);
    });
    startLoop();
  }

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking || prefersReducedMotion) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        sections.forEach((s) => {
          const rect = s.el.getBoundingClientRect();
          const center = rect.top + rect.height / 2 - window.innerHeight / 2;
          s.el.style.setProperty("--fx-scroll-y", center * 0.035 + "px");
        });
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  document.addEventListener(
    "mousemove",
    (e) => {
      sections.forEach((s) => {
        if (!s.active) return;
        const rect = s.el.getBoundingClientRect();
        const lx = (e.clientX - rect.left) / rect.width;
        const ly = (e.clientY - rect.top) / rect.height;
        if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
          s.mouse.x = lx;
          s.mouse.y = ly;
          s.el.style.setProperty("--fx-glow-x", lx * 100 + "%");
          s.el.style.setProperty("--fx-glow-y", ly * 100 + "%");
        }
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    sections.forEach((s) => {
      if (s.active) resizeSection(s);
    });
  });

  sections.forEach((s) => resizeSection(s));

  /* ═══ Magical cursor (restored) ═══ */
  if (isMobile || prefersReducedMotion) return;

  const trailCanvas = document.getElementById("fxTrail");
  const rippleRoot = document.getElementById("fxRipples");
  const cursorDot = document.querySelector(".fx-cursor-dot");
  const cursorRing = document.querySelector(".fx-cursor-ring");
  if (!trailCanvas || !cursorDot || !cursorRing) return;

  const tCtx = trailCanvas.getContext("2d", { alpha: true });
  let tW = 0;
  let tH = 0;
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  const trailPoints = [];
  const maxTrail = 22;
  let lastRipple = 0;
  const bursts = [];

  function resizeTrail() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    tW = window.innerWidth;
    tH = window.innerHeight;
    trailCanvas.width = tW * dpr;
    trailCanvas.height = tH * dpr;
    trailCanvas.style.width = tW + "px";
    trailCanvas.style.height = tH + "px";
    tCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeTrail();
  document.body.classList.add("fx-cursor-active");

  function spawnRipple(x, y, scale) {
    if (!rippleRoot) return;
    const el = document.createElement("div");
    el.className = "fx-ripple";
    const size = 36 + scale * 44;
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.left = x + "px";
    el.style.top = y + "px";
    rippleRoot.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.8;
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        size: Math.random() * 2 + 1,
      });
    }
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trailPoints.push({ x: mouseX, y: mouseY });
    if (trailPoints.length > maxTrail) trailPoints.shift();
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";

    const now = performance.now();
    if (now - lastRipple > 450) {
      lastRipple = now;
      spawnRipple(mouseX, mouseY, 0.3);
    }
  });

  document.addEventListener("mouseleave", () => {
    cursorDot.style.opacity = "0";
    cursorRing.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursorDot.style.opacity = "";
    cursorRing.style.opacity = "";
  });

  const hoverSelector =
    "a, button, .contact-card, .service-item, .nav-links a, .live-btn, .btn-gradient, .btn-outline, .form-submit, .sound-btn, .nav-email, input, textarea, .project-card, .scroll-link";

  document.querySelectorAll(hoverSelector).forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      cursorRing.classList.add("fx-hover");
      spawnBurst(e.clientX, e.clientY, 12);
    });
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("fx-hover"));
  });

  document.addEventListener("mousedown", () => {
    cursorRing.classList.add("fx-click");
    spawnRipple(mouseX, mouseY, 0.55);
    spawnBurst(mouseX, mouseY, 8);
  });
  document.addEventListener("mouseup", () => cursorRing.classList.remove("fx-click"));

  function drawTrail() {
    tCtx.clearRect(0, 0, tW, tH);
    if (trailPoints.length > 1) {
      for (let i = 1; i < trailPoints.length; i++) {
        const a = i / trailPoints.length;
        tCtx.beginPath();
        tCtx.strokeStyle = `rgba(182, 0, 168, ${a * 0.4})`;
        tCtx.lineWidth = 1.5 * a;
        tCtx.lineCap = "round";
        tCtx.moveTo(trailPoints[i - 1].x, trailPoints[i - 1].y);
        tCtx.lineTo(trailPoints[i].x, trailPoints[i].y);
        tCtx.stroke();
      }
      const last = trailPoints[trailPoints.length - 1];
      const g = tCtx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 24);
      g.addColorStop(0, "rgba(182, 0, 168, 0.35)");
      g.addColorStop(1, "transparent");
      tCtx.fillStyle = g;
      tCtx.beginPath();
      tCtx.arc(last.x, last.y, 24, 0, Math.PI * 2);
      tCtx.fill();
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 0.045;
      b.vy += 0.04;
      if (b.life <= 0) {
        bursts.splice(i, 1);
        continue;
      }
      tCtx.beginPath();
      tCtx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
      tCtx.fillStyle = b.color;
      tCtx.globalAlpha = b.life * 0.75;
      tCtx.fill();
      tCtx.globalAlpha = 1;
    }
  }

  function cursorLoop() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    drawTrail();
    requestAnimationFrame(cursorLoop);
  }

  cursorLoop();
  window.addEventListener("resize", resizeTrail);
})();
