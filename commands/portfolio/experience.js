/* experience — work history as a timeline, from content/experience.js. */
Portfolio.command({
  name: 'experience',
  group: 'Portfolio',
  desc: 'work history as a timeline',
  run(args, t) {
    const { cv, esc } = t;
    t.blank();
    const items = cv.experience.map((e, i) => `
      <div class="tl-item">
        <div class="tl-dot ${i === 0 ? 'now' : ''}"></div>
        <div class="tl-body">
          <div><span class="h">${esc(e.role)}</span> <span class="dim">@</span> <span class="accent2">${esc(e.company)}</span></div>
          <div class="dim">${esc(e.from)} → ${esc(e.to)} · ${esc(e.location)}</div>
          ${e.bullets.map(b => `<div class="tl-bullet"><span class="accent">▸</span> ${esc(b)}</div>`).join('')}
          <div class="tags">${e.tech.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
        </div>
      </div>`).join('');
    t.print(`<div class="timeline">${items}</div>`);
    if (t.isCommand('git')) t.print(`<span class="dim">prefer version control? </span>${t.cmd('git log')}`);
  }
});
