/* Virtual filesystem: CV files generated from content, plus files registered by modules. Read-only. */
(function () {
  'use strict';

  const HOME = '/home/guest';

  const dir = (children = {}, extra = {}) => ({ type: 'dir', children, ...extra });
  const file = (content, extra = {}) => ({ type: 'file', content, ...extra });

  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /** Files derived from the CV content. Everything else comes from Portfolio.file(). */
  function buildCV(cv, config) {
    const { wrap } = Portfolio.util;
    const exp = {};
    for (const e of cv.experience || []) {
      exp[`${e.from.slice(0, 4)}-${slugify(e.company)}.md`] = file([
        `# ${e.role}`, `## ${e.company} · ${e.location}`, `${e.from} → ${e.to}`, '',
        ...e.bullets.map(b => `- ${b}`), '', `tech: ${e.tech.join(', ')}`
      ].join('\n'));
    }
    const projects = {};
    for (const p of cv.projects || []) {
      projects[`${p.slug}.md`] = file([
        `# ${p.name}`, '', p.description, '', ...p.details.map(d => `- ${d}`), '',
        `tech: ${p.tech.join(', ')}`, `link: ${p.link}`
      ].join('\n'));
    }
    const skills = (cv.skills || []).map(g => `# ${g.group}\n` + g.items.map(([n, lvl]) => `- ${n.padEnd(22)} ${lvl}%`).join('\n')).join('\n\n');
    const aliases = Object.entries(config.aliases || {}).map(([k, v]) => `alias ${k}='${v}'`).join('\n');

    return dir({
      bin: dir(),
      etc: dir(),
      tmp: dir(),
      home: dir({
        guest: dir({
          'about.txt': file(wrap((cv.about || []).join('\n\n'), 72).join('\n')),
          'contact.txt': file(Object.entries(cv.contact || {}).map(([k, v]) => `${k.padEnd(10)} ${v}`).join('\n')),
          'skills.txt': file(skills),
          'education.txt': file((cv.education || []).map(e => `${e.from}–${e.to}  ${e.degree}\n           ${e.school}\n           ${e.note || ''}`).join('\n\n')),
          experience: dir(exp),
          projects: dir(projects),
          '.mshrc': file(`# msh config — generated from site.config.js\n${aliases}`)
        })
      })
    });
  }

  function normalize(path) {
    const parts = [];
    for (const seg of path.split('/')) {
      if (!seg || seg === '.') continue;
      if (seg === '..') parts.pop(); else parts.push(seg);
    }
    return '/' + parts.join('/');
  }

  function absolute(path, cwd) {
    if (!path || path === '~') return HOME;
    if (path.startsWith('~/')) return normalize(HOME + path.slice(1));
    if (path.startsWith('/')) return normalize(path);
    return normalize(cwd + '/' + path);
  }

  class VFS {
    constructor(cv, config, extras) {
      this.cv = cv;
      this.root = buildCV(cv, config);
      for (const entry of extras) this.add(entry);
    }

    /** Adds a registered file or directory, creating parent directories as needed. */
    add({ path, type, content, ...opts }) {
      const abs = absolute(path, HOME);
      const parts = abs.split('/').filter(Boolean);
      const name = parts.pop();
      let node = this.root;
      for (const seg of parts) {
        node.children[seg] ||= dir();
        node = node.children[seg];
        if (node.type !== 'dir') { console.error(`fs: cannot add ${abs}: ${seg} is a file`); return; }
      }
      if (type === 'dir') node.children[name] = { ...(node.children[name] || dir()), ...opts };
      else node.children[name] = file(content, opts);
    }

    /** Returns { path, node, denied } — node is null when the path does not exist. */
    resolve(path, cwd) {
      const abs = absolute(path, cwd);
      let node = this.root;
      for (const seg of abs.split('/').filter(Boolean)) {
        if (!node || node.type !== 'dir') { node = null; break; }
        if (node.locked) return { path: abs, node: null, denied: true };
        node = node.children[seg] || null;
      }
      return { path: abs, node };
    }

    addBin(names) {
      for (const n of names) this.root.children.bin.children[n] = file(`\u007fELF\u0002\u0001\u0001 — ${n}: a very real binary`, { exec: n, binary: true });
    }

    read(node) {
      return typeof node.content === 'function' ? node.content(this.cv) : (node.content ?? '');
    }
  }

  /** Coloured name for listings: dirs get a slash, executables a star, dotfiles are dimmed. */
  VFS.label = (name, node) => {
    const { esc } = Portfolio.util;
    if (node.type === 'dir') return `<span class="dir">${esc(name)}/</span>`;
    if (node.exec) return `<span class="exec">${esc(name)}*</span>`;
    if (name.startsWith('.')) return `<span class="dim">${esc(name)}</span>`;
    return esc(name);
  };

  VFS.HOME = HOME;
  VFS.prettyPath = p => (p === HOME ? '~' : p.startsWith(HOME + '/') ? '~' + p.slice(HOME.length) : p);
  Portfolio.VFS = VFS;
})();
