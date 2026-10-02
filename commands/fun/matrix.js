/* matrix — "Wake up, guest…" then green rain over the terminal. Any key exits. */
(function () {
  Portfolio.achievement({ id: 'neo', title: 'The One', desc: 'Entered the Matrix', hint: 'Follow the white rabbit. Green rain.' });

  Portfolio.style(`
    .matrix-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; background: #000; }
    .matrix-hint { position: absolute; bottom: 12px; right: 16px; z-index: 6; font-size: 12px; color: #39ff88; opacity: .7; }
  `);

  const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>{}[]$#';
  const SIZE = 16;

  function rain(t) {
    return new Promise(resolve => {
      const host = t.fx.host();
      const canvas = document.createElement('canvas');
      canvas.className = 'matrix-canvas';
      host.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      let drops = [];
      const resize = () => {
        canvas.width = host.clientWidth;
        canvas.height = host.clientHeight;
        drops = Array.from({ length: Math.ceil(canvas.width / SIZE) }, () => Math.random() * -50);
      };
      resize();
      let raf;
      const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${SIZE}px "JetBrains Mono", monospace`;
        drops.forEach((y, i) => {
          ctx.fillStyle = Math.random() > 0.975 ? '#e8ffe8' : '#00ff66';
          ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * SIZE, y * SIZE);
          drops[i] = y * SIZE > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
        });
        raf = requestAnimationFrame(draw);
      };
      draw();
      const hint = document.createElement('div');
      hint.className = 'matrix-hint';
      hint.textContent = 'press any key to exit the matrix';
      host.appendChild(hint);
      const stop = () => {
        cancelAnimationFrame(raf);
        canvas.remove();
        hint.remove();
        removeEventListener('resize', resize);
        host.removeEventListener('click', stop);
        resolve();
      };
      addEventListener('resize', resize);
      host.addEventListener('click', stop);
      t.program = { onKey: e => { e.preventDefault(); stop(); } };
    });
  }

  Portfolio.command({
    name: 'matrix',
    hidden: true,
    desc: 'wake up, guest…',
    aliases: ['cmatrix'],
    async run(args, t) {
      for (const line of ['Wake up, guest...', 'The Matrix has you...', 'Follow the white rabbit.']) {
        await t.type(line, 'ok', 45);
        await t.sleep(500);
      }
      t.printText('Knock, knock.', 'ok');
      await t.sleep(700);
      t.unlock('neo');
      await rain(t);
      t.printText('You took the red pill. Welcome to the real world.', 'dim');
    }
  });
})();
