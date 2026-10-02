/* achievements and hint — progress through every achievement registered by the loaded modules. */
Portfolio.command({
  name: 'achievements',
  group: 'System',
  desc: 'your progress through the easter eggs',
  run(args, t) {
    const all = Portfolio.achievements.all();
    const n = Portfolio.achievements.count();
    if (!all.length) { t.printText('No achievements are installed.', 'dim'); return; }
    t.blank();
    t.print(`<span class="h">Achievements</span>  ${t.meter((n / all.length) * 100, 30)} ${n}/${all.length}`);
    t.blank();
    t.print(`<div class="ach-grid">${all.map(a => Portfolio.achievements.has(a.id)
      ? `<span>🏆</span><span><b>${t.esc(a.title)}</b> <span class="dim">— ${t.esc(a.desc)}</span></span>`
      : '<span class="dim">🔒</span><span class="dim">??? — locked</span>').join('')}</div>`);
    if (n < all.length) t.print(`<span class="dim">need a nudge? </span>${t.cmd('hint')}`);
    else t.print('<span class="ok">100%. You are officially a better explorer than most pentesters.</span>');
  }
});

Portfolio.command({
  name: 'hint',
  group: 'System',
  desc: 'nudge towards a locked achievement',
  run(args, t) {
    const locked = Portfolio.achievements.all().filter(a => !Portfolio.achievements.has(a.id));
    if (!locked.length) { t.printText('No hints left — you found everything!', 'ok'); return; }
    const a = locked[Math.floor(Math.random() * locked.length)];
    t.print(`💡 <span class="accent2">${t.esc(a.hint)}</span>`);
  }
});
