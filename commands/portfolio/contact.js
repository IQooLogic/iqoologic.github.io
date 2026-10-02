/* contact — links from `contact` in content/profile.js. Any key you add there shows up here. */
Portfolio.command({
  name: 'contact',
  group: 'Portfolio',
  desc: 'how to reach me',
  run(args, t) {
    const { cv, esc } = t;
    const rows = Object.entries(cv.contact).map(([k, v]) => {
      const value = k === 'email'
        ? `<a class="ext" href="mailto:${esc(v)}">${esc(v)}</a>`
        : /^https?:\/\//.test(v) ? t.link(v, v.replace(/^https?:\/\/(www\.)?/, '')) : esc(v);
      return `<span class="dim">${esc(k)}</span><span>${value}</span>`;
    });
    rows.push(`<span class="dim">location</span><span>${esc(cv.location)}</span>`);
    t.blank();
    t.print(`<div class="kv">${rows.join('')}</div>`);
    if (t.isCommand('hire')) { t.blank(); t.print(`<span class="dim">or simply run</span> ${t.cmd('./hire-me.sh')}`); }
  }
});
