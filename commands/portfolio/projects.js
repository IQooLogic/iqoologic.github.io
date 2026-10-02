/* projects — project cards, or one project's details with `projects <slug>`. */
Portfolio.command({
  name: 'projects',
  group: 'Portfolio',
  desc: 'things I built — `projects <name>` for details',
  complete: () => Portfolio.cv.projects.map(p => p.slug),
  run(args, t) {
    const { cv, esc } = t;
    if (args[0]) {
      const p = cv.projects.find(x => x.slug === args[0]);
      if (!p) { t.printText(`projects: no such project: ${args[0]}`, 'err'); return 1; }
      t.blank();
      t.print(Portfolio.util.renderText(t.vfs.read(t.vfs.resolve(`~/projects/${p.slug}.md`, t.cwd).node), '.md'));
      return 0;
    }
    t.blank();
    t.print(`<div class="cards">${cv.projects.map(p => `
      <div class="card">
        <div class="card-title">${t.cmd('projects ' + p.slug, p.name)}</div>
        <div>${esc(p.description)}</div>
        <div class="tags">${p.tech.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
        <div class="card-link">${t.link(p.link, p.link.replace(/^https?:\/\//, ''))}</div>
      </div>`).join('')}</div>`);
    if (cv.projects.length) t.print(`<span class="dim">click a name, or run </span>${t.cmd('projects ' + cv.projects[0].slug)}<span class="dim"> · files live in </span>${t.cmd('ls ~/projects')}`);
  }
});
