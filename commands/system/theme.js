/* theme — lists and switches colour themes. Themes are the files in themes/ listed in site.config.js. */
Portfolio.achievement({ id: 'stylist', title: 'Stylist', desc: 'Changed the theme', hint: 'Not a fan of the colours? `theme`.' });

Portfolio.command({
  name: 'theme',
  group: 'System',
  desc: 'change colour theme',
  complete: () => [...Portfolio.app.themes(), 'random'],
  run(args, t) {
    const themes = Portfolio.app.themes();
    const cur = document.documentElement.dataset.theme;
    if (!args[0]) {
      t.print(`current: <span class="accent">${t.esc(cur)}</span>`);
      t.print(`<div class="themes">${themes.map(th => `<a class="cmd theme-chip" href="#" data-cmd="theme ${th}"><span class="theme-dot" data-theme="${th}"></span>${th}</a>`).join('')}</div>`);
      return 0;
    }
    const others = themes.filter(x => x !== cur);
    const th = args[0] === 'random' ? others[Math.floor(Math.random() * others.length)] : args[0];
    if (!themes.includes(th)) { t.printText(`theme: unknown theme "${th}". available: ${themes.join(', ')}, random`, 'err'); return 1; }
    Portfolio.app.setTheme(th);
    t.unlock('stylist');
    t.print(`theme set to <span class="accent">${th}</span>`);
  }
});
