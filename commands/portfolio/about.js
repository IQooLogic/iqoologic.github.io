/* about — the "about me" text from content/profile.js. */
Portfolio.command({
  name: 'about',
  group: 'Portfolio',
  desc: 'who I am',
  run(args, t) {
    const { cv, esc } = t;
    t.blank();
    t.print(`<span class="h">${esc(cv.fullName)}</span> <span class="dim">—</span> <span class="accent2">${esc(cv.title)}</span>`);
    t.print(`<span class="dim">📍 ${esc(cv.location)} · coding for ${Portfolio.util.yearsCoding()} years</span>`);
    t.blank();
    for (const p of cv.about) { t.printText(p); t.blank(); }
    const next = ['skills', 'experience', 'projects', 'contact'].filter(c => t.isCommand(c));
    t.print(`next: ${next.map(c => t.cmd(c)).join(' · ')}`);
  }
});
