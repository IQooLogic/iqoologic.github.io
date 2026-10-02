/* fortune, cowsay, lolcat — the classic trio. Try: fortune | cowsay | lolcat */
(function () {
  const { esc, wrap } = Portfolio.util;

  Portfolio.achievement({ id: 'cow', title: 'Moo', desc: 'Piped wisdom through a cow', hint: '`fortune` and `cowsay` work great together with a |.' });
  Portfolio.achievement({ id: 'rainbow', title: 'Taste the Rainbow', desc: 'Ended a pipe in lolcat', hint: 'Pipe anything into `lolcat`.' });

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

  Portfolio.command({
    name: 'fortune',
    group: 'Fun',
    desc: 'a random piece of wisdom',
    run(args, t) {
      const list = t.cv.fortunes || ['No fortunes installed. Add some in content/fortunes.js.'];
      t.printText(list[Math.floor(Math.random() * list.length)]);
    }
  });

  Portfolio.command({
    name: 'cowsay',
    group: 'Fun',
    desc: 'a cow says things (try: fortune | cowsay)',
    filter: input => { Portfolio.achievements.unlock('cow'); return cowsay(input); },
    run(args, t) { t.print(`<span class="pre">${esc(cowsay(args.join(' ') || 'moo. pipe something into me: fortune | cowsay'))}</span>`); }
  });

  Portfolio.command({
    name: 'lolcat',
    group: 'Fun',
    desc: 'rainbows. pipe anything into it',
    filter: input => { Portfolio.achievements.unlock('rainbow'); return lolcat(input); },
    run(args, t) { t.unlock('rainbow'); t.print(lolcat(args.join(' ') || 'pipe something into me! e.g. neofetch | lolcat').html); }
  });
})();
