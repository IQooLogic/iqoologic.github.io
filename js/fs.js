/* Virtual filesystem generated from window.CV. Read-only, in memory. */
(function () {
  'use strict';

  const HOME = '/home/guest';
  const FLAG = 'flag{curiosity_is_a_security_skill}';

  const dir = (children = {}, extra = {}) => ({ type: 'dir', children, ...extra });
  const file = (content, extra = {}) => ({ type: 'file', content, ...extra });

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function wrapLines(text, width) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        if ((line + ' ' + word).trim().length > width) { out.push(line); line = word; }
        else line = (line ? line + ' ' : '') + word;
      }
      out.push(line);
    }
    return out.join('\n');
  }

  function build(cv) {
    const exp = {};
    for (const e of cv.experience) {
      const name = `${e.from.slice(0, 4)}-${slugify(e.company)}.md`;
      exp[name] = file([
        `# ${e.role}`,
        `## ${e.company} · ${e.location}`,
        `${e.from} → ${e.to}`,
        '',
        ...e.bullets.map(b => `- ${b}`),
        '',
        `tech: ${e.tech.join(', ')}`
      ].join('\n'));
    }

    const projects = {};
    for (const p of cv.projects) {
      projects[`${p.slug}.md`] = file([
        `# ${p.name}`,
        '',
        p.description,
        '',
        ...p.details.map(d => `- ${d}`),
        '',
        `tech: ${p.tech.join(', ')}`,
        `link: ${p.link}`
      ].join('\n'));
    }

    const skillsTxt = cv.skills.map(g =>
      `# ${g.group}\n` + g.items.map(([n, lvl]) => `- ${n.padEnd(22)} ${lvl}%`).join('\n')
    ).join('\n\n');

    const home = dir({
      'about.txt': file(wrapLines(cv.about.join('\n\n'), 72)),
      'contact.txt': file(Object.entries(cv.contact).map(([k, v]) => `${k.padEnd(10)} ${v}`).join('\n')),
      'skills.txt': file(skillsTxt),
      'education.txt': file(cv.education.map(e => `${e.from}–${e.to}  ${e.degree}\n           ${e.school}\n           ${e.note || ''}`).join('\n\n')),
      'experience': dir(exp),
      'projects': dir(projects),
      'resume.pdf': file('%PDF-1.7\n%âãÏÓ\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\nÿØÿà\u0000\u0010JFIF\u0000\u0001\u0001\u0000\u0000\u0001\u0000\u0001\u0000\u0000ÿÛ\u0000C\u0000\b\u0006\u0006\u0007\u0006\u0005\b\u0007\u0007\u0007\t\t\b\n\f\u0014\r\f\u000b\u000b\f\u0019\u0012\u0013\u000f...\n\n(binary gibberish — your terminal is not a PDF viewer)\nhint: run `gui` for a human-friendly, printable résumé.', { binary: true }),
      'hire-me.sh': file('#!/bin/msh\n# Usage: ./hire-me.sh\n# Best script in this directory. Possibly in the world.\nhire --now', { exec: 'hire' }),
      '.mshrc': file("# msh config\nalias ll='ls -la'\nalias la='ls -a'\nalias l='ls'\nalias cls='clear'\nalias h='help'\nalias cv='gui'\nalias resume='gui'\nalias startx='gui'\nalias cmatrix='matrix'\nexport EDITOR=vim  # good luck"),
      '.bash_history': file([
        'git commit -m "fix"', 'git commit -m "fix for real"', 'git commit -m "ok this time for real"',
        'git push --force  # sorry', 'vim main.go', ':q', ':q!', ':wq!!!', 'how to exit vim',
        'sudo !!', 'go test -race ./...', 'golangci-lint run', 'docker system prune -a  # oops',
        'cat ~/.secret/README', 'history -c  # cover tracks (doesn\'t work here)'
      ].join('\n')),
      '.secret': dir({
        'README': file('You found the hidden directory. Curiosity: +1.\n\nThe flag is base64-encoded. A security person would know what to do:\n\n    base64 -d ~/.secret/flag.b64\n'),
        'flag.b64': file(btoa(FLAG))
      })
    });

    return dir({
      bin: dir({}),
      etc: dir({
        motd: file(`Welcome to PortfolioOS 26.10 "Curious Cat"\n\n * Documentation: help\n * Support:       contact\n * Résumé (GUI):  gui\n\n0 updates can be applied immediately. Everything is up to date. Like ${cv.name}.`),
        hostname: file(`${cv.handle}-portfolio`),
        'os-release': file('NAME="PortfolioOS"\nVERSION="26.10 (Curious Cat)"\nID=portfolioos\nID_LIKE=linux\nPRETTY_NAME="PortfolioOS 26.10"\nHOME_URL="https://example.com"\nSUPPORT_URL="mailto:you@example.com"'),
        passwd: file(`root:x:0:0:root:/root:/bin/msh\n${cv.handle}:x:1000:1000:${cv.fullName}:/home/${cv.handle}:/bin/msh\nguest:x:1001:1001:Curious Visitor:/home/guest:/bin/msh\nrecruiter:x:1337:1337:Welcome!:/home/guest:/bin/hire`),
        shadow: file('', { locked: true })
      }),
      home: dir({ guest: home, [cv.handle]: dir({}, { locked: true }) }),
      root: dir({}, { locked: true }),
      tmp: dir({}),
      dev: dir({ null: file(''), random: file('4 // chosen by fair dice roll. guaranteed to be random. (xkcd 221)') }),
      var: dir({
        log: dir({
          'coffee.log': file([
            '[07:58:02] coffeed: boot sequence started',
            '[07:58:03] coffeed: grinding beans (18g, medium-fine)',
            '[07:58:40] coffeed: brew complete. productivity +35%',
            '[10:30:11] coffeed: WARN caffeine levels dropping',
            '[10:31:00] coffeed: second cup dispatched',
            '[14:02:17] coffeed: ERROR afternoon slump detected, retrying...',
            '[14:05:00] coffeed: third cup. stable.'
          ].join('\n')),
          'auth.log': file('Oct  2 09:13:37 portfolio sshd[1337]: Accepted curiosity for guest from 127.0.0.1\nOct  2 09:14:02 portfolio sudo: guest : user NOT in sudoers ; COMMAND=/bin/everything')
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
    constructor(cv) { this.root = build(cv); }

    /** Returns { path, node } — node is null when the path does not exist. */
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
      const bin = this.root.children.bin.children;
      for (const n of names) bin[n] = file(`\u007fELF\u0002\u0001\u0001 — ${n}: a very real binary`, { exec: n, binary: true });
    }

    read(node) {
      return typeof node.content === 'function' ? node.content() : node.content;
    }
  }

  window.VFS = VFS;
  window.VFS.HOME = HOME;
  window.VFS.FLAG = FLAG;
  window.VFS.prettyPath = p => (p === HOME ? '~' : p.startsWith(HOME + '/') ? '~' + p.slice(HOME.length) : p);
})();
