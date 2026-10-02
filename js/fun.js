/* Easter eggs, games and visual effects. */
(function () {
  'use strict';
  const { store, esc } = window.MSH;

  const body = () => document.getElementById('body');
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ── achievements ───────────────────────────────────── */
  const ACHIEVEMENTS = [
    { id: 'explorer',  title: 'Explorer',                       desc: 'Wandered outside the home directory',  hint: 'The filesystem is bigger than ~. Try `cd /`.' },
    { id: 'curious',   title: 'Curious Cat',                    desc: 'Found the hidden directory',           hint: 'Dotfiles are hidden by default. `ls -a` shows them.' },
    { id: 'cracker',   title: 'Code Breaker',                   desc: 'Captured the flag',                    hint: 'Something in ~/.secret is encoded…' },
    { id: 'sudo',      title: 'Nice Try',                       desc: 'Attempted to become root',             hint: 'With great power comes… `sudo`.' },
    { id: 'sandwich',  title: 'xkcd 149',                       desc: 'Asked politely for a sandwich',        hint: 'Make me a sandwich. No? What if you insist?' },
    { id: 'vim',       title: 'Escape Artist',                  desc: 'Successfully exited vim',              hint: 'Open the editor everyone fears. Then leave.' },
    { id: 'destroyer', title: 'Chaos Agent',                    desc: 'Tried to delete everything',           hint: 'The most dangerous command in Unix. Go on, it is fake.' },
    { id: 'neo',       title: 'The One',                        desc: 'Entered the Matrix',                   hint: 'Follow the white rabbit. Green rain.' },
    { id: 'snake',     title: 'Snake Charmer',                  desc: 'Scored 10+ in snake',                  hint: 'There is a game hidden in /bin.' },
    { id: 'train',     title: 'Choo Choo',                      desc: 'Mistyped ls',                          hint: 'Typos have consequences. Swap two letters of `ls`.' },
    { id: 'hacker',    title: '1337 h4x0r',                     desc: 'Hacked the mainframe',                 hint: 'Every movie hacker types one word. `hack`.' },
    { id: 'cow',       title: 'Moo',                            desc: 'Piped wisdom through a cow',           hint: '`fortune` and `cowsay` work great together with a |.' },
    { id: 'rainbow',   title: 'Taste the Rainbow',              desc: 'Ended a pipe in lolcat',               hint: 'Pipe anything into `lolcat`.' },
    { id: 'stylist',   title: 'Stylist',                        desc: 'Changed the theme',                    hint: 'Not a fan of the colours? `theme`.' },
    { id: 'recruiter', title: 'Talent Scout',                   desc: 'Opened the GUI résumé',                hint: 'Not a terminal person? There is a GUI.' },
    { id: 'historian', title: 'Historian',                      desc: 'Read the career git log',              hint: 'Careers have version control too. `git log`.' },
    { id: 'konami',    title: 'Old School',                     desc: 'Entered the Konami code',              hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
    { id: 'power',     title: 'Have You Tried Turning It Off?', desc: 'Rebooted the system',                  hint: 'The classic IT fix. `reboot`.' },
    { id: 'hire',      title: 'Excellent Decision',             desc: 'Ran hire-me.sh',                       hint: 'There is an executable script in ~.' }
  ];

  const unlocked = new Set(store.get('achievements', []));

  function toast(html, cls = '') {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + cls;
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(() => el.classList.add('out'), 4200);
    setTimeout(() => el.remove(), 4800);
  }

  function unlock(id) {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) { console.error(`fun: unknown achievement "${id}"`); return; }
    if (unlocked.has(id)) return;
    unlocked.add(id);
    store.set('achievements', [...unlocked]);
    toast(`<div class="toast-k">🏆 Achievement unlocked · ${unlocked.size}/${ACHIEVEMENTS.length}</div><div class="toast-t">${esc(a.title)}</div><div class="toast-d">${esc(a.desc)}</div>`);
    if (unlocked.size === ACHIEVEMENTS.length) {
      setTimeout(() => {
        toast('<div class="toast-k">💎 100% complete</div><div class="toast-t">You found everything.</div><div class="toast-d">Seriously, we should work together.</div>', 'gold');
        confetti(300);
      }, 1500);
    }
  }

  /* ── confetti ───────────────────────────────────────── */
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

  /* ── matrix rain ────────────────────────────────────── */
  function matrix(t) {
    return new Promise(resolve => {
      const host = body();
      const canvas = document.createElement('canvas');
      canvas.className = 'overlay-canvas';
      host.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const size = 16;
      const resize = () => { canvas.width = host.clientWidth; canvas.height = host.clientHeight; };
      resize();
      let drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -50);
      const glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789GOLANG<>{}[]$#';
      let raf;
      const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${size}px "JetBrains Mono", monospace`;
        drops.forEach((y, i) => {
          const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillStyle = Math.random() > 0.975 ? '#e8ffe8' : '#00ff66';
          ctx.fillText(ch, i * size, y * size);
          drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
        });
        raf = requestAnimationFrame(draw);
      };
      draw();
      const hint = document.createElement('div');
      hint.className = 'overlay-hint';
      hint.textContent = 'press any key to exit the matrix';
      host.appendChild(hint);
      const stop = () => {
        cancelAnimationFrame(raf);
        canvas.remove(); hint.remove();
        removeEventListener('resize', onResize);
        host.removeEventListener('click', stop);
        resolve();
      };
      const onResize = () => { resize(); drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => 0); };
      addEventListener('resize', onResize);
      host.addEventListener('click', stop);
      t.program = { onKey: e => { e.preventDefault(); stop(); } };
    });
  }

  /* ── snake ──────────────────────────────────────────── */
  function snake(t) {
    return new Promise(resolve => {
      const COLS = 24, ROWS = 16, CELL = 18;
      const line = t.print('', 'game');
      const canvas = document.createElement('canvas');
      canvas.width = COLS * CELL; canvas.height = ROWS * CELL;
      canvas.className = 'snake-canvas';
      const status = document.createElement('div');
      status.className = 'dim';
      line.append(canvas, status);
      t.scroll();
      const ctx = canvas.getContext('2d');
      let best = store.get('snake-best', 0);
      let s, dir, nextDir, food, score, alive, timer;

      const placeFood = () => {
        do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
        while (s.some(p => p.x === food.x && p.y === food.y));
      };
      const reset = () => {
        s = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
        dir = nextDir = { x: 1, y: 0 };
        score = 0; alive = true;
        placeFood();
        clearInterval(timer);
        timer = setInterval(step, 110);
        render();
      };
      const render = () => {
        ctx.fillStyle = cssVar('--bg2'); ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = cssVar('--err');
        ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
        s.forEach((p, i) => {
          ctx.fillStyle = i === 0 ? cssVar('--accent2') : cssVar('--ok');
          ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
        });
        status.innerHTML = alive
          ? `score <b class="accent">${score}</b> · best ${best} · arrows/WASD/swipe to move · <b>q</b> to quit`
          : `<span class="err">game over</span> — score <b class="accent">${score}</b> · best ${best} · <b>r</b> retry · <b>q</b> quit`;
      };
      const step = () => {
        dir = nextDir;
        const head = { x: (s[0].x + dir.x + COLS) % COLS, y: (s[0].y + dir.y + ROWS) % ROWS };
        if (s.some(p => p.x === head.x && p.y === head.y)) {
          alive = false; clearInterval(timer);
          if (score > best) { best = score; store.set('snake-best', best); }
          render(); return;
        }
        s.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          if (score >= 10) unlock('snake');
          placeFood();
        } else s.pop();
        render();
      };
      const turn = (x, y) => { if (dir.x !== -x || dir.y !== -y) nextDir = { x, y }; };
      const quit = () => {
        clearInterval(timer);
        status.innerHTML = `exited — final score <b class="accent">${score}</b> · best ${best}`;
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchend', onTouchEnd);
        resolve();
      };
      let touch = null;
      const onTouchStart = e => { touch = e.touches[0]; e.preventDefault(); };
      const onTouchEnd = e => {
        if (!touch) return;
        const dx = e.changedTouches[0].clientX - touch.clientX, dy = e.changedTouches[0].clientY - touch.clientY;
        if (!alive) reset();
        else if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
        touch = null;
      };
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);

      t.program = {
        onKey: e => {
          const k = e.key.toLowerCase();
          const moves = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
          if (moves[k]) { e.preventDefault(); turn(...moves[k]); }
          else if (k === 'q' || k === 'escape' || (e.ctrlKey && k === 'c')) { e.preventDefault(); quit(); }
          else if (k === 'r' && !alive) reset();
        }
      };
      reset();
    });
  }

  /* ── sl (steam locomotive) ──────────────────────────── */
  const TRAIN = String.raw`
      ====        ________                ___________
  _D _|  |_______/        \__I_I_____===__|_________|
   |(_)---  |   H\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__
__/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\___/
  \_/      \O=====O=====O=====O_/      \_/`;
  const SMOKE = ['                (  )  (@@) ( )  (@)  ()    @@    O     @', '           (@@@)                                        ', '        (    )                                           '];

  function sl() {
    return new Promise(resolve => {
      const host = body();
      const pre = document.createElement('pre');
      pre.className = 'train';
      pre.textContent = SMOKE.join('\n') + TRAIN;
      host.appendChild(pre);
      const from = host.clientWidth, to = -pre.offsetWidth;
      const duration = 4200, start = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        pre.style.transform = `translateX(${from + (to - from) * p}px)`;
        if (p < 1) requestAnimationFrame(frame); else { pre.remove(); resolve(); }
      })(start);
    });
  }

  /* ── vim ────────────────────────────────────────────── */
  function vim(t, file = '') {
    return new Promise(resolve => {
      const host = body();
      const box = document.createElement('div');
      box.className = 'vim';
      const rows = Math.max(10, Math.floor(host.clientHeight / 22) - 2);
      const splash = [
        '', '', 'VIM - Vi IMproved', '', 'version 9.1 (portfolio edition)', 'by Bram Moolenaar et al.',
        '', 'It is not a trap. Probably.', '',
        'type  :q<Enter>              to exit',
        'type  :help hire<Enter>      for something useful',
        'type  :wq<Enter>             to pretend you saved'
      ];
      const lines = [];
      for (let i = 0; i < rows; i++) {
        const s = file ? '' : (splash[i - 1] ?? '');
        lines.push(`<div><span class="tilde">~</span><span class="vim-center">${esc(s)}</span></div>`);
      }
      box.innerHTML = `<div class="vim-lines">${lines.join('')}</div><div class="vim-status"><span class="vim-cmd"></span><span class="vim-pos">0,0-1 All</span></div>`;
      host.appendChild(box);
      const cmdEl = box.querySelector('.vim-cmd');
      if (file) cmdEl.textContent = `"${file}" [readonly] — you can look, but you can't touch`;
      let buffer = null;
      const exit = () => { box.remove(); unlock('vim'); resolve(); };
      t.program = {
        onKey: e => {
          e.preventDefault();
          if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { cmdEl.textContent = 'Type  :qa!  and press <Enter> to abandon all changes and exit Vim'; buffer = null; return; }
          if (buffer === null) {
            if (e.key === ':') { buffer = ''; cmdEl.textContent = ':'; }
            else if (e.key === 'i') cmdEl.textContent = '-- INSERT -- (just kidding, this file is read-only. Try :q)';
            else if (e.key === 'Escape') cmdEl.textContent = '';
            else if (e.key.length === 1) cmdEl.textContent = 'Hint: press  :  then  q  then  Enter';
            return;
          }
          if (e.key === 'Escape') { buffer = null; cmdEl.textContent = ''; }
          else if (e.key === 'Backspace') { if (!buffer) { buffer = null; cmdEl.textContent = ''; } else { buffer = buffer.slice(0, -1); cmdEl.textContent = ':' + buffer; } }
          else if (e.key === 'Enter') {
            const c = buffer.trim();
            buffer = null;
            if (['q', 'q!', 'wq', 'wq!', 'x', 'qa', 'qa!', 'quit', 'exit'].includes(c)) exit();
            else if (c.startsWith('help')) cmdEl.textContent = 'Recruiting? Exit with :q and run `hire`. Seriously, it is the best command here.';
            else if (c === 'w') cmdEl.textContent = 'E45: \'readonly\' option is set (add ! to override... it will not help)';
            else cmdEl.textContent = `E492: Not an editor command: ${c}`;
          } else if (e.key.length === 1) { buffer += e.key; cmdEl.textContent = ':' + buffer; }
        }
      };
    });
  }

  /* ── power off / on (CRT collapse) ──────────────────── */
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

  /* ── konami ─────────────────────────────────────────── */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kpos = 0;
  function party() {
    document.documentElement.classList.add('party');
    confetti(220);
    setTimeout(() => document.documentElement.classList.remove('party'), 6000);
  }
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; party(); unlock('konami'); }
  }, true);

  /* ── text helpers ───────────────────────────────────── */
  function wrap(text, width) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/)) {
        if (line && (line + ' ' + word).length > width) { out.push(line); line = word; }
        else line = line ? line + ' ' + word : word;
      }
      out.push(line);
    }
    return out;
  }

  function cowsay(text) {
    const lines = wrap(text.trim() || 'moo', 40);
    const w = Math.max(...lines.map(l => l.length));
    const bubble = lines.length === 1
      ? [`< ${lines[0]} >`]
      : lines.map((l, i) => {
        const [a, b] = i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|'];
        return `${a} ${l.padEnd(w)} ${b}`;
      });
    return [' ' + '_'.repeat(w + 2), ...bubble, ' ' + '-'.repeat(w + 2),
      String.raw`        \   ^__^`,
      String.raw`         \  (oo)\_______`,
      String.raw`            (__)\       )\/\ `,
      String.raw`                ||----w |`,
      String.raw`                ||     ||`].join('\n');
  }

  function lolcat(text) {
    const seed = Math.random() * 360;
    const html = text.split('\n').map((line, row) =>
      [...line].map((ch, col) => ch === ' ' ? ' ' : `<span style="color:hsl(${(seed + row * 6 + col * 4) % 360} 90% 65%)">${esc(ch)}</span>`).join('')
    ).join('\n');
    return { html: `<span class="pre">${html}</span>`, text };
  }

  window.FUN = { ACHIEVEMENTS, unlocked, unlock, toast, confetti, matrix, snake, sl, vim, powerOff, party, cowsay, lolcat, wrap };
})();
