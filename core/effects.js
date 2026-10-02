/* Shared visual effects (Portfolio.fx) and the achievement tracker (Portfolio.achievements). */
(function () {
  'use strict';
  const { esc, store } = Portfolio.util;

  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /** The terminal's screen area — full-screen programs draw on top of it. */
  const host = () => document.getElementById('body');

  function toast(html, cls = '') {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + cls;
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), 4200);
    setTimeout(() => el.remove(), 4800);
  }

  function confetti(count = 160) {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['--accent', '--accent2', '--ok', '--warn', '--err', '--cyan'].map(cssVar);
    const parts = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight / 3,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4,
      r: Math.random() * 6 + 3, a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      if (now - start < 4000) requestAnimationFrame(frame); else canvas.remove();
    })(start);
  }

  /** CRT collapse, then waits for a key or click to power back on. */
  function powerOff() {
    return new Promise(resolve => {
      const win = document.getElementById('window');
      win.classList.add('poweroff');
      setTimeout(() => {
        const btn = document.createElement('button');
        btn.className = 'power-btn';
        btn.innerHTML = '<span>⏻</span> press any key to power on';
        document.body.appendChild(btn);
        const on = () => {
          removeEventListener('keydown', on);
          btn.remove();
          win.classList.remove('poweroff');
          resolve();
        };
        btn.addEventListener('click', on);
        setTimeout(() => addEventListener('keydown', on), 300);
      }, 900);
    });
  }

  function party() {
    document.documentElement.classList.add('party');
    confetti(220);
    setTimeout(() => document.documentElement.classList.remove('party'), 6000);
  }

  Portfolio.fx = { cssVar, host, toast, confetti, powerOff, party };

  /* ── achievements ───────────────────────────────────── */
  const unlocked = new Set(store.get('achievements', []));

  Portfolio.achievements = {
    all: () => Portfolio.registry.achievements,
    has: id => unlocked.has(id),
    /** Unlocked achievements that still exist (a removed module's achievement is ignored). */
    count: () => Portfolio.registry.achievements.filter(a => unlocked.has(a.id)).length,
    unlock(id) {
      const all = Portfolio.registry.achievements;
      const a = all.find(x => x.id === id);
      if (!a) { console.error(`achievements: unknown achievement "${id}" — register it with Portfolio.achievement()`); return; }
      if (unlocked.has(id)) return;
      unlocked.add(id);
      store.set('achievements', [...unlocked]);
      const n = this.count();
      toast(`<div class="toast-k">🏆 Achievement unlocked · ${n}/${all.length}</div><div class="toast-t">${esc(a.title)}</div><div class="toast-d">${esc(a.desc)}</div>`);
      if (n === all.length) {
        setTimeout(() => {
          toast('<div class="toast-k">💎 100% complete</div><div class="toast-t">You found everything.</div><div class="toast-d">Seriously, we should work together.</div>', 'gold');
          confetti(300);
        }, 1500);
      }
    }
  };
})();
