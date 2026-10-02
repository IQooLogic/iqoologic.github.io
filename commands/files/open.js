/* open — opens a contact link (any key in `contact`), a project, or a URL in a new tab. */
Portfolio.command({
  name: 'open',
  group: 'Files',
  desc: 'open a link: github, linkedin, website, email, or a project',
  complete: () => [...Object.keys(Portfolio.cv.contact), ...Portfolio.cv.projects.map(p => p.slug)],
  run(args, t) {
    const { cv } = t;
    const k = args[0];
    const links = Object.fromEntries(Object.entries(cv.contact).map(([key, v]) => [key, key === 'email' ? `mailto:${v}` : v]));
    const p = cv.projects.find(x => x.slug === k);
    const url = links[k] || (p && p.link) || (k && /^https?:\/\//.test(k) ? k : null);
    if (!url) { t.print(`usage: open &lt;${Object.keys(links).join('|')}|project&gt;`, 'err'); return 1; }
    window.open(url, '_blank', 'noopener');
    t.print(`opening ${t.link(url)} …`);
  }
});
