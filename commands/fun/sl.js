/* sl — a steam locomotive for people who mistype ls. Not interruptible, like the real one. */
(function () {
  Portfolio.achievement({ id: 'train', title: 'Choo Choo', desc: 'Mistyped ls', hint: 'Typos have consequences. Swap two letters of `ls`.' });

  Portfolio.style(`
    .train { position: absolute; top: 30%; left: 0; z-index: 5; margin: 0;
      color: var(--fg); font-size: var(--fs); line-height: 1.15; pointer-events: none; white-space: pre; }
  `);

  const SMOKE = [
    '                (  )  (@@) ( )  (@)  ()    @@    O     @',
    '           (@@@)                                        ',
    '        (    )                                           '
  ];
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

  function drive(t) {
    return new Promise(resolve => {
      const host = t.fx.host();
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

  Portfolio.command({
    name: 'sl',
    hidden: true,
    desc: 'you meant ls',
    async run(args, t) {
      t.unlock('train');
      await drive(t);
      t.print(`<span class="dim">🚂 sl: you meant </span>${t.cmd('ls')}<span class="dim">. (Ctrl+C does not stop trains.)</span>`);
    }
  });
})();
