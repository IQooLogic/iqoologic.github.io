/* skills — animated skill bars from content/skills.js. */
Portfolio.command({
  name: 'skills',
  group: 'Portfolio',
  desc: 'technical skills (animated, obviously)',
  async run(args, t) {
    const { cv, esc, meter } = t;
    const width = window.innerWidth < 600 ? 12 : 24;
    const bars = [];
    t.blank();
    for (const g of cv.skills) {
      t.print(`<span class="h">${esc(g.group)}</span>`);
      for (const [name, lvl] of g.items) {
        const line = t.print('');
        if (line) bars.push({ line, name, lvl });
        else t.printText(`  ${name.padEnd(22)} ${lvl}%`); // inside a pipe: plain text
      }
      t.blank();
    }
    const frames = 16;
    for (let f = 1; f <= frames; f++) {
      for (const b of bars) {
        const cur = (b.lvl * f) / frames;
        b.line.innerHTML = `  <span class="skill-name">${esc(b.name)}</span>${meter(cur, width)} <span class="dim">${String(Math.round(cur)).padStart(3)}%</span>`;
      }
      await t.sleep(28);
    }
    if (t.isCommand('nmap')) t.print(`<span class="dim">tip: ${t.cmd('nmap localhost')} shows the same thing, but for security people.</span>`);
  }
});
