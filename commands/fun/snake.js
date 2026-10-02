/* snake — arrows / WASD / swipe. Best score is remembered in this browser. */
(function () {
  Portfolio.achievement({ id: 'snake', title: 'Snake Charmer', desc: 'Scored 10+ in snake', hint: 'There is a game hidden in /bin.' });

  Portfolio.style(`
    .game { white-space: normal; }
    .snake-canvas { display: block; max-width: 100%; border: 1px solid var(--dim); border-radius: 4px; margin: 6px 0; touch-action: none; image-rendering: pixelated; }
  `);

  const COLS = 24, ROWS = 16, CELL = 18, TICK_MS = 110, GOAL = 10;
  const MOVES = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };

  function play(t) {
    return new Promise(resolve => {
      const { cssVar } = t.fx;
      const line = t.print('', 'game');
      const canvas = document.createElement('canvas');
      canvas.width = COLS * CELL;
      canvas.height = ROWS * CELL;
      canvas.className = 'snake-canvas';
      const status = document.createElement('div');
      status.className = 'dim';
      line.append(canvas, status);
      t.scroll();
      const ctx = canvas.getContext('2d');
      let best = t.store.get('snake-best', 0);
      let body, dir, nextDir, food, score, alive, timer;

      const placeFood = () => {
        do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
        while (body.some(p => p.x === food.x && p.y === food.y));
      };
      const render = () => {
        ctx.fillStyle = cssVar('--bg2');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = cssVar('--err');
        ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
        body.forEach((p, i) => {
          ctx.fillStyle = i === 0 ? cssVar('--accent2') : cssVar('--ok');
          ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
        });
        status.innerHTML = alive
          ? `score <b class="accent">${score}</b> · best ${best} · arrows/WASD/swipe to move · <b>q</b> to quit`
          : `<span class="err">game over</span> — score <b class="accent">${score}</b> · best ${best} · <b>r</b> retry · <b>q</b> quit`;
      };
      const step = () => {
        dir = nextDir;
        const head = { x: (body[0].x + dir.x + COLS) % COLS, y: (body[0].y + dir.y + ROWS) % ROWS };
        if (body.some(p => p.x === head.x && p.y === head.y)) {
          alive = false;
          clearInterval(timer);
          if (score > best) { best = score; t.store.set('snake-best', best); }
          render();
          return;
        }
        body.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          if (score >= GOAL) t.unlock('snake');
          placeFood();
        } else body.pop();
        render();
      };
      const reset = () => {
        body = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
        dir = nextDir = { x: 1, y: 0 };
        score = 0;
        alive = true;
        placeFood();
        clearInterval(timer);
        timer = setInterval(step, TICK_MS);
        render();
      };
      const turn = (x, y) => { if (dir.x !== -x || dir.y !== -y) nextDir = { x, y }; };

      let touch = null;
      const onTouchStart = e => { touch = e.touches[0]; e.preventDefault(); };
      const onTouchEnd = e => {
        if (!touch) return;
        const dx = e.changedTouches[0].clientX - touch.clientX, dy = e.changedTouches[0].clientY - touch.clientY;
        if (!alive) reset();
        else if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0);
        else turn(0, Math.sign(dy));
        touch = null;
      };
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);

      const quit = () => {
        clearInterval(timer);
        status.innerHTML = `exited — final score <b class="accent">${score}</b> · best ${best}`;
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchend', onTouchEnd);
        resolve();
      };
      t.program = {
        onKey: e => {
          const k = e.key.toLowerCase();
          if (MOVES[k]) { e.preventDefault(); turn(...MOVES[k]); }
          else if (k === 'q' || k === 'escape' || (e.ctrlKey && k === 'c')) { e.preventDefault(); quit(); }
          else if (k === 'r' && !alive) reset();
        }
      };
      reset();
    });
  }

  Portfolio.command({
    name: 'snake',
    hidden: true,
    desc: 'the classic. arrows/WASD',
    async run(args, t) {
      t.printText(`🐍 snake — eat the red squares. score ${GOAL} for an achievement.`, 'dim');
      await play(t);
    }
  });
})();
