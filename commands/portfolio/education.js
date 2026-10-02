/* education — degrees, certifications and languages. */
Portfolio.command({
  name: 'education',
  group: 'Portfolio',
  desc: 'degrees and certifications',
  run(args, t) {
    const { cv, esc } = t;
    t.blank();
    for (const e of cv.education) {
      t.print(`<span class="h">${esc(e.degree)}</span> <span class="dim">·</span> <span class="accent2">${esc(e.school)}</span> <span class="dim">(${esc(e.from)}–${esc(e.to)})</span>`);
      if (e.note) t.print(`  <span class="dim">${esc(e.note)}</span>`);
    }
    if ((cv.certifications || []).length) {
      t.blank();
      t.print('<span class="h">Certifications</span>');
      cv.certifications.forEach(c => t.print(`  <span class="accent">▸</span> ${esc(c)}`));
    }
    t.blank();
    t.print('<span class="h">Languages</span>');
    cv.languages.forEach(([l, lvl]) => t.print(`  <span class="accent">▸</span> ${esc(l)} <span class="dim">— ${esc(lvl)}</span>`));
  }
});
