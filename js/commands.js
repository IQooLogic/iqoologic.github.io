/* Every command available in msh. */
(function () {
  'use strict';
  const { esc, store, meter } = window.MSH;
  const CV = window.CV;
  const FUN = window.FUN;
  const pretty = window.VFS.prettyPath;

  const THEMES = ['midnight', 'dracula', 'matrix', 'amber', 'nord', 'ubuntu', 'paper'];
  const yearsCoding = () => new Date().getFullYear() - CV.startedCoding;

  const levelLabel = n => n >= 90 ? 'expert' : n >= 75 ? 'advanced' : n >= 60 ? 'proficient' : 'learning';

  function hash7(s) {
    let h = 2166136261;
    for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
  }

  function browserName() {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Microsoft Edge';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Chrome\//.test(ua)) return 'Chromium-based browser';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Mystery Browser';
  }

  /** Markdown-lite colouring for cat. */
  function renderFile(text, name) {
    if (!/\.(md|txt)$|README|motd/.test(name)) return `<span class="pre">${esc(text)}</span>`;
    return text.split('\n').map(l => {
      if (l.startsWith('## ')) return `<span class="accent2">${esc(l.slice(3))}</span>`;
      if (l.startsWith('# ')) return `<span class="h">${esc(l.slice(2))}</span>`;
      if (l.startsWith('- ')) return `  <span class="accent">▸</span> ${esc(l.slice(2))}`;
      const kv = l.match(/^(tech|link):\s(.*)$/);
      if (kv) return `<span class="dim">${kv[1]}:</span> ${kv[1] === 'link' ? `<a class="ext" href="${esc(kv[2])}" target="_blank" rel="noopener noreferrer">${esc(kv[2])}</a>` : esc(kv[2])}`;
      return esc(l);
    }).join('\n');
  }

  function readInput(t, args, cmdName) {
    const files = args.filter(a => !a.startsWith('-'));
    if (!files.length) { t.printText(`${cmdName}: missing file operand (or pipe something in: cat about.txt | ${cmdName} ...)`, 'err'); return null; }
    const { node } = t.vfs.resolve(files[files.length - 1], t.cwd);
    if (!node) { t.printText(`${cmdName}: ${files[files.length - 1]}: No such file or directory`, 'err'); return null; }
    if (node.type === 'dir') { t.printText(`${cmdName}: ${files[files.length - 1]}: Is a directory`, 'err'); return null; }
    return t.vfs.read(node);
  }

  function register(t) {
    const R = (name, def) => t.register(name, def);
    const H = (name, def) => t.register(name, { hidden: true, group: 'Secret', ...def });

    /* ── Portfolio ─────────────────────────────────────── */
    R('help', {
      group: 'Portfolio', desc: 'list available commands',
      run(args) {
        const groups = ['Portfolio', 'Files', 'System', 'Fun'];
        const all = t.visibleCommands();
        t.blank();
        for (const g of groups) {
          const cmds = all.filter(c => c.group === g);
          if (!cmds.length) continue;
          t.print(`<span class="h">${g}</span>`);
          t.print(`<div class="help-grid">${cmds.map(c => `<span>${t.cmd(c.name)}</span><span class="dim">${esc(c.desc)}</span>`).join('')}</div>`);
        }
        const hidden = [...t.commands.values()].filter(c => c.hidden).length;
        t.print(`<span class="dim">…and <b class="accent2">${hidden}</b> hidden commands. Explore. Achievements: ${FUN.unlocked.size}/${FUN.ACHIEVEMENTS.length} — stuck? try ${t.cmd('hint')}.</span>`);
        t.print(`<span class="dim">Keys: Tab complete · ↑↓ history · → accept suggestion · Ctrl+C cancel · Ctrl+L clear · pipes work: </span>${t.cmd('fortune | cowsay')}`);
      }
    });

    R('about', {
      group: 'Portfolio', desc: 'who I am',
      async run() {
        t.blank();
        t.print(`<span class="h">${esc(CV.fullName)}</span> <span class="dim">—</span> <span class="accent2">${esc(CV.title)}</span>`);
        t.print(`<span class="dim">📍 ${esc(CV.location)} · coding for ${yearsCoding()} years</span>`);
        t.blank();
        for (const p of CV.about) { t.printText(p); t.blank(); }
        t.print(`next: ${t.cmd('skills')} · ${t.cmd('experience')} · ${t.cmd('projects')} · ${t.cmd('contact')}`);
      }
    });

    R('skills', {
      group: 'Portfolio', desc: 'technical skills (animated, obviously)',
      async run(args) {
        const W = window.innerWidth < 600 ? 12 : 24;
        const bars = [];
        t.blank();
        for (const g of CV.skills) {
          t.print(`<span class="h">${esc(g.group)}</span>`);
          for (const [name, lvl] of g.items) {
            const line = t.print('');
            if (line) bars.push({ line, name, lvl });
            else t.printText(`  ${name.padEnd(22)} ${lvl}%`);
          }
          t.blank();
        }
        const frames = 16;
        for (let f = 1; f <= frames; f++) {
          for (const b of bars) {
            const cur = (b.lvl * f) / frames;
            b.line.innerHTML = `  <span class="skill-name">${esc(b.name)}</span>${meter(cur, W)} <span class="dim">${String(Math.round(cur)).padStart(3)}%</span>`;
          }
          await t.sleep(28);
        }
        t.print(`<span class="dim">tip: ${t.cmd('nmap localhost')} shows the same thing, but for security people.</span>`);
      }
    });

    R('experience', {
      group: 'Portfolio', desc: 'work history as a timeline',
      run() {
        t.blank();
        const items = CV.experience.map((e, i) => `
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
        t.print(`<span class="dim">prefer version control? </span>${t.cmd('git log')}`);
      }
    });

    R('projects', {
      group: 'Portfolio', desc: 'things I built — `projects <name>` for details',
      complete: () => CV.projects.map(p => p.slug),
      run(args) {
        if (args[0]) {
          const p = CV.projects.find(x => x.slug === args[0]);
          if (!p) { t.printText(`projects: no such project: ${args[0]}`, 'err'); return 1; }
          t.blank();
          t.print(renderFile(t.vfs.read(t.vfs.resolve(`~/projects/${p.slug}.md`, t.cwd).node), '.md'));
          return 0;
        }
        t.blank();
        t.print(`<div class="cards">${CV.projects.map(p => `
          <div class="card">
            <div class="card-title">${t.cmd('projects ' + p.slug, p.name)}</div>
            <div>${esc(p.description)}</div>
            <div class="tags">${p.tech.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
            <div class="card-link">${t.link(p.link, p.link.replace(/^https?:\/\//, ''))}</div>
          </div>`).join('')}</div>`);
        t.print(`<span class="dim">click a name, or run </span>${t.cmd('projects ' + CV.projects[0].slug)}<span class="dim"> · files live in </span>${t.cmd('ls ~/projects')}`);
      }
    });

    R('education', {
      group: 'Portfolio', desc: 'degrees and certifications',
      run() {
        t.blank();
        for (const e of CV.education) {
          t.print(`<span class="h">${esc(e.degree)}</span> <span class="dim">·</span> <span class="accent2">${esc(e.school)}</span> <span class="dim">(${esc(e.from)}–${esc(e.to)})</span>`);
          if (e.note) t.print(`  <span class="dim">${esc(e.note)}</span>`);
        }
        if (CV.certifications.length) {
          t.blank();
          t.print('<span class="h">Certifications</span>');
          CV.certifications.forEach(c => t.print(`  <span class="accent">▸</span> ${esc(c)}`));
        }
        t.blank();
        t.print('<span class="h">Languages</span>');
        CV.languages.forEach(([l, lvl]) => t.print(`  <span class="accent">▸</span> ${esc(l)} <span class="dim">— ${esc(lvl)}</span>`));
      }
    });

    R('contact', {
      group: 'Portfolio', desc: 'how to reach me',
      run() {
        const c = CV.contact;
        t.blank();
        t.print(`<div class="kv">
          <span class="dim">email</span><span><a class="ext" href="mailto:${esc(c.email)}">${esc(c.email)}</a></span>
          <span class="dim">github</span><span>${t.link(c.github, c.github.replace(/^https?:\/\//, ''))}</span>
          <span class="dim">linkedin</span><span>${t.link(c.linkedin, c.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</span>
          <span class="dim">website</span><span>${t.link(c.website, c.website.replace(/^https?:\/\//, ''))}</span>
          <span class="dim">location</span><span>${esc(CV.location)}</span>
        </div>`);
        t.blank();
        t.print(`<span class="dim">or simply run</span> ${t.cmd('./hire-me.sh')}`);
      }
    });

    R('gui', {
      group: 'Portfolio', desc: 'classic résumé view (printable / PDF)',
      run() { window.GUI.open(); FUN.unlock('recruiter'); t.printText('Opening the GUI résumé… (Esc to come back)', 'dim'); }
    });

    R('neofetch', {
      group: 'Portfolio', desc: 'system info, portfolio flavoured',
      run() {
        const logo = String.raw`
        .--.
       |o_o |
       |:_/ |
      //   \ \
     (|     | )
    /'\_   _/'\
    \___)=(___/`;
        const skillCount = CV.skills.reduce((n, g) => n + g.items.length, 0);
        const theme = document.documentElement.dataset.theme;
        const rows = [
          ['OS', 'PortfolioOS 26.10 "Curious Cat" x86_64'],
          ['Host', `${CV.fullName}`],
          ['Role', CV.title],
          ['Kernel', '6.9.0-coffee'],
          ['Uptime', `${yearsCoding()} years (since ${CV.startedCoding})`],
          ['Packages', `${skillCount} skills, ${CV.projects.length} projects`],
          ['Shell', 'msh 2.0'],
          ['Resolution', `${screen.width}x${screen.height}`],
          ['Theme', theme],
          ['Terminal', browserName()],
          ['CPU', 'Brain v1 @ 3.6 GHz (caffeinated)'],
          ['Memory', `${(navigator.deviceMemory || 8) * 512}MiB / ${(navigator.deviceMemory || 8) * 1024}MiB`],
          ['Location', CV.location],
          ['Languages', CV.languages.map(l => l[0]).join(', ')]
        ];
        const swatches = ['--err', '--ok', '--warn', '--accent', '--accent2', '--cyan', '--fg', '--dim']
          .map(v => `<span class="swatch" style="background:var(${v})"></span>`).join('');
        t.print(`<div class="neofetch"><pre class="logo">${esc(logo)}</pre><div>
          <div><span class="accent">guest</span>@<span class="accent">${esc(CV.handle)}-portfolio</span></div>
          <div class="dim">${'─'.repeat(26)}</div>
          ${rows.map(([k, v]) => `<div><span class="accent">${k}</span>: ${esc(v)}</div>`).join('')}
          <div class="swatches">${swatches}</div>
        </div></div>`);
      }
    });

    R('banner', { group: 'Portfolio', desc: 'show the welcome banner', run() { window.APP.welcome(t); } });

    /* ── Files ─────────────────────────────────────────── */
    const lsName = (name, node) => {
      if (node.type === 'dir') return `<span class="dir">${esc(name)}/</span>`;
      if (node.exec) return `<span class="exec">${esc(name)}*</span>`;
      if (name.startsWith('.')) return `<span class="dim">${esc(name)}</span>`;
      return esc(name);
    };

    R('ls', {
      group: 'Files', desc: 'list directory contents (-a, -l)',
      run(args) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const targets = args.filter(a => !a.startsWith('-'));
        const all = flags.includes('a'), long = flags.includes('l');
        let status = 0;
        for (const target of targets.length ? targets : ['.']) {
          const { node, path, denied } = t.vfs.resolve(target, t.cwd);
          if (denied || (node && node.locked)) { t.printText(`ls: cannot open directory '${target}': Permission denied`, 'err'); status = 2; continue; }
          if (!node) { t.printText(`ls: cannot access '${target}': No such file or directory`, 'err'); status = 2; continue; }
          if (!path.startsWith(window.VFS.HOME)) FUN.unlock('explorer');
          if (targets.length > 1) t.print(`<span class="h">${esc(target)}:</span>`);
          const entries = node.type === 'dir' ? Object.entries(node.children) : [[target, node]];
          const visible = entries.filter(([n]) => all || !n.startsWith('.')).sort(([a], [b]) => a.localeCompare(b));
          if (all && node.type === 'dir' && path === window.VFS.HOME) FUN.unlock('curious');
          if (long) {
            const rows = (all ? [['.', node], ['..', { type: 'dir' }]] : []).concat(visible).map(([n, c]) => {
              const perm = c.type === 'dir' ? 'drwxr-xr-x' : c.exec ? '-rwxr-xr-x' : c.locked ? '-rw-------' : '-rw-r--r--';
              const size = c.type === 'dir' ? 4096 : (t.vfs.read(c) || '').length;
              return `<span class="dim">${perm}  guest guest ${String(size).padStart(6)}  Oct  2 13:37</span>  ${lsName(n, c)}`;
            });
            t.print(`<span class="dim">total ${visible.length * 4}</span>\n${rows.join('\n')}`);
          } else if (visible.length) {
            t.print(`<div class="ls-grid">${visible.map(([n, c]) => `<span>${lsName(n, c)}</span>`).join('')}</div>`);
          }
          if (!all && node.type === 'dir' && path === window.VFS.HOME && !store.get('ls-hint', false)) {
            store.set('ls-hint', true);
            t.print('<span class="dim">(some files are hidden… real hackers know the flag)</span>');
          }
        }
        return status;
      }
    });

    R('cd', {
      group: 'Files', desc: 'change directory',
      run(args) {
        let target = args[0] || '~';
        if (target === '-') target = t.prevCwd;
        const { node, path, denied } = t.vfs.resolve(target, t.cwd);
        if (denied || (node && node.locked)) { t.printText(`cd: permission denied: ${target}`, 'err'); return 1; }
        if (!node) { t.printText(`cd: no such file or directory: ${target}`, 'err'); return 1; }
        if (node.type !== 'dir') { t.printText(`cd: not a directory: ${target}`, 'err'); return 1; }
        t.prevCwd = t.cwd;
        t.cwd = path;
        if (!path.startsWith(window.VFS.HOME)) FUN.unlock('explorer');
        if (path.includes('/.secret')) FUN.unlock('curious');
        return 0;
      }
    });

    R('pwd', { group: 'Files', desc: 'print working directory', run() { t.printText(t.cwd); } });

    R('cat', {
      group: 'Files', desc: 'print a file',
      filter: input => input,
      run(args) {
        if (!args.length) { t.printText('cat: missing file operand. try: cat about.txt', 'err'); return 1; }
        let status = 0;
        for (const a of args) {
          const { node, denied } = t.vfs.resolve(a, t.cwd);
          if (denied || (node && node.locked)) { t.printText(`cat: ${a}: Permission denied`, 'err'); status = 1; continue; }
          if (!node) { t.printText(`cat: ${a}: No such file or directory`, 'err'); status = 1; continue; }
          if (node.type === 'dir') { t.printText(`cat: ${a}: Is a directory`, 'err'); status = 1; continue; }
          t.print(renderFile(t.vfs.read(node), a), node.binary ? 'binary' : '');
          if (a.includes('.secret')) FUN.unlock('curious');
        }
        return status;
      }
    });
    t.alias('less', 'cat');
    t.alias('more', 'cat');
    t.alias('bat', 'cat');

    R('tree', {
      group: 'Files', desc: 'show the directory tree',
      run(args) {
        const all = args.includes('-a');
        const target = args.find(a => !a.startsWith('-')) || '.';
        const { node } = t.vfs.resolve(target, t.cwd);
        if (!node || node.type !== 'dir') { t.printText(`tree: ${target}: not a directory`, 'err'); return 1; }
        let dirs = 0, files = 0;
        const walk = (n, prefix) => Object.entries(n.children)
          .filter(([k]) => all || !k.startsWith('.'))
          .sort(([a], [b]) => a.localeCompare(b))
          .flatMap(([k, c], i, arr) => {
            const last = i === arr.length - 1;
            const lineHtml = `<span class="dim">${prefix}${last ? '└── ' : '├── '}</span>${lsName(k, c)}`;
            if (c.type === 'dir') { dirs++; return [lineHtml, ...(c.locked ? [] : walk(c, prefix + (last ? '    ' : '│   ')))]; }
            files++;
            return [lineHtml];
          });
        const lines = walk(node, '');
        t.print([`<span class="dir">${esc(target)}</span>`, ...lines, '', `<span class="dim">${dirs} directories, ${files} files</span>`].join('\n'));
      }
    });

    R('open', {
      group: 'Files', desc: 'open a link: github, linkedin, website, email, or a project',
      complete: ['github', 'linkedin', 'website', 'email', ...CV.projects.map(p => p.slug)],
      run(args) {
        const k = args[0];
        const c = CV.contact;
        const map = { github: c.github, linkedin: c.linkedin, website: c.website, email: `mailto:${c.email}` };
        const p = CV.projects.find(x => x.slug === k);
        const url = map[k] || (p && p.link) || (k && /^https?:\/\//.test(k) ? k : null);
        if (!url) { t.print(`usage: open &lt;${Object.keys(map).join('|')}|project&gt;`, 'err'); return 1; }
        window.open(url, '_blank', 'noopener');
        t.print(`opening ${t.link(url)} …`);
      }
    });

    /* ── text filters (pipe-friendly) ──────────────────── */
    const filters = {
      grep: { desc: 'search text (works with pipes)', fn(input, args) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const pattern = args.find(a => !a.startsWith('-'));
        if (!pattern) return 'usage: grep [-i] [-v] PATTERN';
        const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags.includes('i') ? 'gi' : 'g');
        const lines = input.split('\n').filter(l => { re.lastIndex = 0; return re.test(l) !== flags.includes('v'); });
        return { text: lines.join('\n'), html: `<span class="pre">${lines.map(l => esc(l).replace(new RegExp(esc(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), re.flags), m => `<mark>${m}</mark>`)).join('\n')}</span>` };
      } },
      head: { desc: 'first lines', fn: (input, args) => input.split('\n').slice(0, parseInt((args.find(a => /^-?\d+$/.test(a)) || '-10').replace('-', ''), 10)).join('\n') },
      tail: { desc: 'last lines', fn: (input, args) => input.split('\n').slice(-parseInt((args.find(a => /^-?\d+$/.test(a)) || '-10').replace('-', ''), 10)).join('\n') },
      wc: { desc: 'count lines, words, chars', fn: (input, args) => {
        const l = input.split('\n').length, w = input.split(/\s+/).filter(Boolean).length, c = input.length;
        return args.includes('-l') ? String(l) : args.includes('-w') ? String(w) : `${String(l).padStart(7)} ${String(w).padStart(7)} ${String(c).padStart(7)}`;
      } },
      sort: { desc: 'sort lines', fn: (input, args) => { const s = input.split('\n').sort(); return (args.includes('-r') ? s.reverse() : s).join('\n'); } },
      uniq: { desc: 'drop repeated lines', fn: input => input.split('\n').filter((l, i, a) => l !== a[i - 1]).join('\n') },
      rev: { desc: 'reverse each line', fn: input => input.split('\n').map(l => [...l].reverse().join('')).join('\n') },
      tac: { desc: 'reverse line order', fn: input => input.split('\n').reverse().join('\n') }
    };
    for (const [name, f] of Object.entries(filters)) {
      R(name, {
        group: 'Files', desc: f.desc, hidden: name !== 'grep',
        filter: (input, args) => f.fn(input, args),
        run(args) {
          const operands = args.filter(a => !a.startsWith('-'));
          if (name === 'grep' && !operands.length) { t.printText('usage: grep [-i] [-v] PATTERN [FILE]', 'err'); return 1; }
          const files = name === 'grep' ? operands.slice(1) : operands;
          const input = readInput(t, files, name);
          if (input === null) return 1;
          const out = f.fn(input, args);
          if (typeof out === 'object') t.print(out.html); else t.printText(out);
        }
      });
    }

    R('base64', {
      group: 'Files', desc: 'encode / decode (-d) base64',
      filter: (input, args) => decodeOrEncode(input, args),
      run(args) {
        const input = readInput(t, args, 'base64');
        if (input === null) return 1;
        const out = decodeOrEncode(input, args);
        t.printText(out, out.startsWith('base64:') ? 'err' : '');
      }
    });
    function decodeOrEncode(input, args) {
      if (!args.includes('-d') && !args.includes('--decode')) return btoa(unescape(encodeURIComponent(input)));
      try {
        const out = decodeURIComponent(escape(atob(input.trim())));
        if (out === window.VFS.FLAG) {
          FUN.unlock('cracker');
          setTimeout(() => FUN.confetti(120), 50);
          return out + '\n\n🎉 Flag captured. Curiosity is the #1 security skill — that is why I have it on my CV.';
        }
        return out;
      } catch (err) {
        console.warn('base64: decode failed', err);
        return 'base64: invalid input';
      }
    }

    for (const name of ['rm', 'mv', 'cp', 'mkdir', 'touch', 'chmod', 'chown', 'rmdir']) {
      R(name, {
        group: 'Files', hidden: name !== 'rm', desc: name === 'rm' ? 'remove files (careful…)' : 'read-only, sorry',
        async run(args) {
          if (name === 'rm' && args.some(a => /^-\w*r\w*f|^-\w*f\w*r/.test(a)) && args.some(a => ['/', '/*', '~', '*', '.'].includes(a))) {
            return window.APP.nuke(t);
          }
          if (name === 'rm' && !args.length) { t.printText('rm: missing operand', 'err'); return 1; }
          t.printText(`${name}: cannot modify '${args.filter(a => !a.startsWith('-')).join(' ') || '.'}': Read-only file system (my CV is immutable, like a good audit log)`, 'err');
          return 1;
        }
      });
    }

    /* ── System ────────────────────────────────────────── */
    R('clear', { group: 'System', desc: 'clear the screen (Ctrl+L)', run() { t.clear(); } });

    R('history', {
      group: 'System', desc: 'command history (-c to clear)',
      run(args) {
        if (args.includes('-c')) { t.history = []; store.set('history', []); t.printText('history cleared. (the NSA still has a copy)', 'dim'); return; }
        t.print(t.history.map((h, i) => `<span class="dim">${String(i + 1).padStart(4)}</span>  ${esc(h)}`).join('\n'));
      },
      filter: () => t.history.join('\n')
    });

    R('theme', {
      group: 'System', desc: 'change colour theme', complete: THEMES,
      run(args) {
        const cur = document.documentElement.dataset.theme;
        if (!args[0]) {
          t.print(`current: <span class="accent">${cur}</span>`);
          t.print(`<div class="themes">${THEMES.map(th => `<a class="cmd theme-chip" href="#" data-cmd="theme ${th}" data-theme-preview="${th}"><span class="theme-dot" data-theme="${th}"></span>${th}</a>`).join('')}</div>`);
          return 0;
        }
        const th = args[0] === 'random' ? THEMES.filter(x => x !== cur)[Math.floor(Math.random() * (THEMES.length - 1))] : args[0];
        if (!THEMES.includes(th)) { t.printText(`theme: unknown theme "${th}". available: ${THEMES.join(', ')}, random`, 'err'); return 1; }
        window.APP.setTheme(th);
        FUN.unlock('stylist');
        t.print(`theme set to <span class="accent">${th}</span>`);
      }
    });

    R('crt', {
      group: 'System', desc: 'toggle CRT scanlines & glow', complete: ['on', 'off'],
      run(args) {
        const win = document.getElementById('window');
        const on = args[0] ? args[0] === 'on' : !win.classList.contains('crt');
        win.classList.toggle('crt', on);
        store.set('crt', on);
        t.printText(`crt effect ${on ? 'on' : 'off'}`, 'dim');
      }
    });

    R('achievements', {
      group: 'System', desc: 'your progress through the easter eggs',
      run() {
        const n = FUN.unlocked.size, total = FUN.ACHIEVEMENTS.length;
        t.blank();
        t.print(`<span class="h">Achievements</span>  ${meter((n / total) * 100, 30)} ${n}/${total}`);
        t.blank();
        t.print(`<div class="ach-grid">${FUN.ACHIEVEMENTS.map(a => FUN.unlocked.has(a.id)
          ? `<span>🏆</span><span><b>${esc(a.title)}</b> <span class="dim">— ${esc(a.desc)}</span></span>`
          : '<span class="dim">🔒</span><span class="dim">??? — locked</span>').join('')}</div>`);
        if (n < total) t.print(`<span class="dim">need a nudge? </span>${t.cmd('hint')}`);
        else t.print('<span class="ok">100%. You are officially a better explorer than most pentesters.</span>');
      }
    });

    R('hint', {
      group: 'System', desc: 'nudge towards a locked achievement',
      run() {
        const locked = FUN.ACHIEVEMENTS.filter(a => !FUN.unlocked.has(a.id));
        if (!locked.length) { t.printText('No hints left — you found everything!', 'ok'); return; }
        const a = locked[Math.floor(Math.random() * locked.length)];
        t.print(`💡 <span class="accent2">${esc(a.hint)}</span>`);
      }
    });

    R('whoami', {
      group: 'System', desc: 'print current user',
      run() { t.printText('guest'); t.print(`<span class="dim">…but you probably meant </span>${t.cmd('about')}`); },
      filter: () => 'guest'
    });

    R('date', { group: 'System', desc: 'current date and time', run() { t.printText(new Date().toString()); }, filter: () => new Date().toString() });

    R('uptime', {
      group: 'System', desc: 'how long I have been coding',
      run() {
        const s = Math.floor(performance.now() / 1000);
        t.printText(` ${new Date().toTimeString().slice(0, 8)} up ${yearsCoding()} years, ${new Date().getMonth() * 30} days,  1 user,  load average: 0.42, 0.37, 0.31 (coffee-bound)`);
        t.printText(` (this session: ${Math.floor(s / 60)}m ${s % 60}s — thanks for staying)`, 'dim');
      }
    });

    R('uname', {
      group: 'System', desc: 'system information',
      run(args) { t.printText(args.includes('-a') ? `PortfolioOS ${CV.handle}-portfolio 6.9.0-coffee #1 SMP PREEMPT_DYNAMIC Fri Oct 2 13:37:00 CEST 2026 x86_64 GNU/Msh` : 'PortfolioOS'); }
    });

    R('echo', {
      group: 'System', desc: 'print text ($VARS expand)',
      run(args) { t.printText(args.join(' ')); },
      filter: (input, args) => args.join(' ')
    });

    R('env', {
      group: 'System', desc: 'environment variables',
      run() { t.print(Object.entries(t.env).map(([k, v]) => `<span class="accent">${esc(k)}</span>=${esc(v)}`).join('\n')); },
      filter: () => Object.entries(t.env).map(([k, v]) => `${k}=${v}`).join('\n')
    });
    t.alias('printenv', 'env');

    R('export', {
      group: 'System', desc: 'set a variable: export NAME=value',
      run(args) {
        for (const a of args) {
          const m = a.match(/^([A-Za-z_]\w*)=(.*)$/);
          if (!m) { t.printText(`export: not a valid identifier: ${a}`, 'err'); return 1; }
          t.env[m[1]] = m[2];
        }
      }
    });

    R('alias', {
      group: 'System', desc: 'list or define aliases',
      run(args) {
        if (!args.length) { t.print(Object.entries(t.aliases).map(([k, v]) => `alias <span class="accent">${esc(k)}</span>='${esc(v)}'`).join('\n')); return; }
        const m = args.join(' ').match(/^([\w.-]+)=(.+)$/);
        if (!m) { t.printText('usage: alias name=\'command\'', 'err'); return 1; }
        t.alias(m[1], m[2]);
      }
    });

    R('man', {
      group: 'System', desc: 'manual for a command',
      complete: () => t.visibleCommands().map(c => c.name),
      run(args) {
        if (!args[0]) { t.printText('What manual page do you want?\nFor example, try `man ls`.'); return 1; }
        const c = t.commands.get(args[0]);
        if (!c) { t.printText(`No manual entry for ${args[0]}`, 'err'); return 1; }
        if (c.name === 'man') { t.printText('man(1): an interface to the system reference manuals. Yes, you just read the manual for the manual.'); return; }
        t.print(`<span class="h">${esc(c.name.toUpperCase())}(1)</span>                 <span class="dim">msh manual</span>\n\n<span class="h">NAME</span>\n       ${esc(c.name)} — ${esc(c.desc || 'undocumented. it is a secret, after all.')}\n\n<span class="h">SYNOPSIS</span>\n       ${esc(c.usage)}${c.filter ? ' [args]   (also reads from a pipe)' : ' [args]'}\n\n<span class="h">BUGS</span>\n       None known. Found one? ${t.cmd('contact')}`);
      }
    });

    R('which', {
      group: 'System', desc: 'locate a command',
      run(args) {
        for (const a of args) {
          if (t.aliases[a]) t.printText(`${a}: aliased to ${t.aliases[a]}`);
          else if (t.commands.has(a)) t.printText(`/bin/${a}`);
          else { t.printText(`${a} not found`, 'err'); return 1; }
        }
      }
    });

    R('exit', {
      group: 'System', desc: 'shut down (try it)',
      async run() { return window.APP.shutdown(t); }
    });
    t.alias('logout', 'exit');
    t.alias('shutdown', 'exit');
    t.alias('poweroff', 'exit');
    t.alias('halt', 'exit');
    R('reboot', { group: 'System', desc: 'turn it off and on again', async run() { return window.APP.shutdown(t, { reboot: true }); } });

    /* ── Fun ───────────────────────────────────────────── */
    R('fortune', {
      group: 'Fun', desc: 'a random piece of wisdom',
      run() { t.printText(CV.fortunes[Math.floor(Math.random() * CV.fortunes.length)]); }
    });
    R('cowsay', {
      group: 'Fun', desc: 'a cow says things (try: fortune | cowsay)',
      filter: input => { FUN.unlock('cow'); return FUN.cowsay(input); },
      run(args) { t.print(`<span class="pre">${esc(FUN.cowsay(args.join(' ') || 'moo. pipe something into me: fortune | cowsay'))}</span>`); }
    });
    R('lolcat', {
      group: 'Fun', desc: 'rainbows. pipe anything into it',
      filter: input => { FUN.unlock('rainbow'); return FUN.lolcat(input); },
      run(args) { FUN.unlock('rainbow'); t.print(FUN.lolcat(args.join(' ') || 'pipe something into me! e.g. neofetch | lolcat').html); }
    });

    H('matrix', {
      desc: 'wake up, guest…',
      async run() {
        for (const l of ['Wake up, guest...', 'The Matrix has you...', 'Follow the white rabbit.']) {
          await t.type(l, 'ok', 45);
          await t.sleep(500);
        }
        t.printText('Knock, knock.', 'ok');
        await t.sleep(700);
        FUN.unlock('neo');
        await FUN.matrix(t);
        t.printText('You took the red pill. Welcome to the real world.', 'dim');
      }
    });

    H('snake', {
      desc: 'the classic. arrows/WASD',
      async run() { t.printText('🐍 snake — eat the red squares. score 10 for an achievement.', 'dim'); await FUN.snake(t); }
    });

    H('sl', {
      desc: 'you meant ls',
      async run() { FUN.unlock('train'); await FUN.sl(); t.print(`<span class="dim">🚂 sl: you meant </span>${t.cmd('ls')}<span class="dim">. (Ctrl+C does not stop trains.)</span>`); }
    });

    for (const ed of ['vim', 'vi', 'nvim', 'nano', 'emacs']) {
      H(ed, {
        desc: 'the editor',
        async run(args) {
          if (ed === 'emacs') { t.printText('emacs: a great operating system, lacking only a decent editor. Launching vim instead…', 'dim'); await t.sleep(900); }
          if (ed === 'nano') { t.printText('nano: real security engineers use… fine, here is vim anyway.', 'dim'); await t.sleep(900); }
          await FUN.vim(t, args[0] || '');
          t.print(`<span class="ok">You exited vim.</span> <span class="dim">Put that on your CV. I did.</span>`);
        }
      });
    }

    H('sudo', {
      desc: 'superuser do',
      async run(args) {
        FUN.unlock('sudo');
        const cmd = args.join(' ');
        if (cmd === 'make me a sandwich') { FUN.unlock('sandwich'); t.printText('Okay. 🥪'); return; }
        if (/^hire|^\.\/hire-me\.sh/.test(cmd)) { t.printText('[sudo] permission granted. You clearly know what you are doing.', 'ok'); return t.run(['hire']); }
        if (/^rm\s/.test(cmd)) return t.run(cmd.split(/\s+/));
        if (!cmd) { t.printText('usage: sudo command', 'err'); return 1; }
        for (let attempt = 1; attempt <= 3; attempt++) {
          await t.readLine('[sudo] password for guest: ', { mask: true });
          await t.sleep(500);
          if (attempt < 3) t.printText('Sorry, try again.', 'err');
        }
        t.printText('sudo: 3 incorrect password attempts', 'err');
        t.printText('guest is not in the sudoers file. This incident will be reported.', 'err');
        await t.sleep(400);
        await t.progress('📨 reporting incident to santa', 900, 16);
        t.print(`<span class="dim">(you are now on the naughty list. psst — </span>${t.cmd('sudo hire')}<span class="dim"> works.)</span>`);
        return 1;
      }
    });

    H('make', {
      desc: 'build things',
      run(args) {
        if (args.join(' ') === 'me a sandwich') { t.printText('What? Make it yourself.', 'err'); return 1; }
        if (args[0] === 'coffee') return t.run(['coffee']);
        t.printText(`make: *** No rule to make target '${args[0] || 'all'}'.  Stop.`, 'err');
        return 2;
      }
    });

    H('coffee', {
      desc: 'brew a cup',
      async run() {
        const cup = String.raw`
      ( (
       ) )
    ........
    |      |]
    \      /
     '----'`;
        await t.progress('☕ grinding beans', 600, 16);
        await t.progress('☕ brewing', 900, 16);
        t.print(`<span class="pre warn">${esc(cup)}</span>`);
        t.printText('Here you go. Productivity +35%. (Also: I run on this.)', 'dim');
      }
    });

    H('hack', {
      desc: 'hack the mainframe',
      async run(args) {
        const target = args[0] || 'recruiter-mainframe.local';
        t.print(`<span class="err">[*]</span> msh-sploit v6.6.6 — target: <b>${esc(target)}</b>`);
        await t.sleep(300);
        for (const step of ['bypassing firewall', 'injecting SQL into the coffee machine', 'downloading more RAM', 'reversing the polarity', 'decrypting with ROT26 (double ROT13)']) {
          await t.progress(`[+] ${step}`, 500 + Math.random() * 500, 20);
        }
        for (let i = 0; i < 8; i++) {
          const hex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ');
          t.print(`<span class="dim">${(0x7ff000 + i * 16).toString(16)}</span>  <span class="ok">${hex}</span>`);
          await t.sleep(60);
        }
        await t.sleep(300);
        t.print('<span class="granted">ACCESS GRANTED</span>');
        FUN.unlock('hacker');
        await t.sleep(800);
        t.print(`<span class="dim">Relax — nothing was hacked. That was pure Hollywood.\nReal security work is quieter: threat models, packet captures, and good logs.\nIf you need someone who knows what real attacks look like (and how to stop them): </span>${t.cmd('contact')}`);
      }
    });

    H('nmap', {
      desc: 'scan for open ports (= skills)',
      async run(args) {
        const target = args.find(a => !a.startsWith('-')) || 'localhost';
        const ports = [22, 53, 80, 443, 1337, 2375, 3000, 4222, 5432, 6379, 8080, 8443, 9090, 9092, 9200, 11211, 27017, 31337, 50051, 6443, 8000];
        const skills = CV.skills.flatMap(g => g.items);
        t.printText(`Starting Nmap 7.95 ( https://nmap.org ) at ${new Date().toISOString().slice(0, 16).replace('T', ' ')} CEST`);
        await t.sleep(600);
        t.printText(`Nmap scan report for ${target} (127.0.0.1)\nHost is up (0.00042s latency).\nNot shown: ${65535 - skills.length} closed tcp ports (reset)`);
        t.print(`<span class="h">PORT       STATE  SERVICE                 VERSION</span>`);
        for (let i = 0; i < skills.length; i++) {
          const [name, lvl] = skills[i];
          const port = `${ports[i % ports.length] + Math.floor(i / ports.length)}/tcp`;
          t.print(`${port.padEnd(10)} <span class="ok">open</span>   ${esc(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').padEnd(23))} <span class="dim">${levelLabel(lvl)} (${lvl}%)</span>`);
          await t.sleep(40);
        }
        t.printText(`\nService detection performed. 1 IP address (1 host up) scanned in ${(skills.length * 0.04 + 0.6).toFixed(2)} seconds`);
        t.print('<span class="dim">OS details: Human, caffeinated, actively learning. No vulnerabilities found. 😉</span>');
      }
    });

    H('ping', {
      desc: 'ping a host',
      async run(args) {
        const host = args[0] || CV.handle;
        t.printText(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
        let n = 0;
        try {
          for (n = 1; n <= 4; n++) {
            await t.sleep(700);
            t.printText(`64 bytes from ${host}: icmp_seq=${n} ttl=64 time=${(Math.random() * 0.4 + 0.05).toFixed(3)} ms${host === CV.handle ? '  (always responsive)' : ''}`);
          }
        } finally {
          t.printText(`\n--- ${host} ping statistics ---\n${n - 1} packets transmitted, ${n - 1} received, 0% packet loss`);
        }
      }
    });

    H('yes', {
      desc: 'y forever (Ctrl+C to stop)',
      async run(args) {
        const w = args.join(' ') || 'y';
        for (let i = 0; i < 2000; i++) { t.printText(w); await t.sleep(25); }
      }
    });

    H('top', {
      desc: 'process list',
      run() {
        const procs = [
          ['1', 'systemd', '0.1', 'init (since ' + CV.startedCoding + ')'],
          ['42', 'curiosity', '38.0', 'never sleeps'],
          ['137', 'go-build', '24.5', 'compiling side projects'],
          ['443', 'tls-handshake', '9.8', 'fingerprinting your browser (kidding)'],
          ['666', 'imposter-syndrome', '0.0', 'suspended (SIGSTOP)'],
          ['1337', 'ctf-solver', '12.2', 'weekends only'],
          ['2048', 'coffeed', '15.4', 'critical, do not kill'],
          ['8080', 'learning', '∞', 'always running']
        ];
        t.print(`<span class="dim">top - ${new Date().toTimeString().slice(0, 8)} up ${yearsCoding()} years · Tasks: ${procs.length} · load: high (curiosity)</span>\n<span class="h">${'PID'.padEnd(7)}${'COMMAND'.padEnd(20)}${'%CPU'.padEnd(7)}NOTE</span>\n` +
          procs.map(([p, c, cpu, n]) => `${p.padEnd(7)}<span class="accent">${c.padEnd(20)}</span>${cpu.padEnd(7)}<span class="dim">${n}</span>`).join('\n'));
      }
    });
    t.alias('htop', 'top');
    t.alias('btop', 'top');

    H('git', {
      desc: 'career version control',
      run(args) {
        const sub = args[0];
        if (sub === 'log') {
          FUN.unlock('historian');
          const oneline = args.includes('--oneline');
          const commits = [
            ...CV.experience.map(e => ({ date: e.from, msg: `feat(career): join ${e.company} as ${e.role}`, body: e.bullets })),
            ...CV.education.map(e => ({ date: e.to + '-07', msg: `feat(edu): graduate — ${e.degree}`, body: [e.school] })),
            { date: `${CV.startedCoding}-01`, msg: 'chore: initial commit — print("hello, world")', body: ['It compiled on the first try. Never again.'] }
          ];
          const out = commits.map((c, i) => {
            const h = hash7(c.msg);
            const refs = i === 0 ? ' <span class="accent2">(</span><span class="cyan">HEAD -&gt; </span><span class="ok">main</span><span class="accent2">, </span><span class="err">origin/main</span><span class="accent2">)</span>' : '';
            if (oneline) return `<span class="warn">${h}</span>${refs} ${esc(c.msg)}`;
            const d = new Date(c.date + '-01T10:00:00');
            return `<span class="warn">commit ${h}${hash7(c.date)}${hash7(h)}${hash7(c.msg + 'x').slice(0, 5)}</span>${refs}\nAuthor: ${esc(CV.fullName)} &lt;${esc(CV.contact.email)}&gt;\nDate:   ${d.toDateString()}\n\n    ${esc(c.msg)}\n${c.body.map(b => '\n    ' + esc(b)).join('')}\n`;
          });
          t.print(out.join('\n'));
          return;
        }
        if (sub === 'status') { t.print('On branch <span class="ok">main</span>\nYour branch is ahead of \'origin/expectations\' by 9001 commits.\n\nnothing to commit, working tree clean — open to new opportunities though'); return; }
        if (sub === 'blame') { t.printText(`${hash7('blame')} (${CV.fullName} ${new Date().toISOString().slice(0, 10)}) it was me. it's always me.`); return; }
        if (sub === 'push' && args.some(a => a.startsWith('--force') || a === '-f')) { t.printText('remote: rejected. force-pushing to main is a fireable offence. ask me how I know.', 'err'); return 1; }
        if (sub === 'clone') { t.print(`Cloning into '${esc(args[1] || 'milos')}'… fatal: humans cannot be cloned (yet). The next best thing: ${t.cmd('contact')}`); return 128; }
        if (!sub) { t.print(`usage: git &lt;command&gt;\n\n   ${t.cmd('git log')}       career history\n   ${t.cmd('git status')}    current status\n   ${t.cmd('git blame')}     who did this?`); return 1; }
        t.printText(`git: '${sub}' is not a git command. See 'git --help'.`, 'err');
        return 1;
      }
    });

    H('weather', {
      desc: 'forecast',
      run() {
        t.print(`<span class="pre"><span class="warn">    \\   /    </span> ${esc(CV.location)}
<span class="warn">     .-.     </span> Sunny with a chance of commits
<span class="warn">  ― (   ) ―  </span> +23 °C (feels like a productive day)
<span class="warn">     \`-'     </span> ↗ 5 km/h of fresh ideas
<span class="warn">    /   \\    </span> 0.0 mm of bugs</span>`);
      }
    });
    t.alias('curl', 'weather');

    H('ssh', {
      desc: 'connect to a host',
      run(args) { t.printText(`ssh: connect to host ${args[0] || 'nowhere'} port 22: Connection refused — you are already inside. 🙂`, 'err'); return 255; }
    });

    H('hire', {
      desc: 'the best decision you will make today',
      async run() {
        FUN.unlock('hire');
        await t.progress('📄 compiling résumé', 500, 16);
        await t.progress('🤝 preparing handshake', 500, 16);
        FUN.confetti(180);
        t.print('<span class="granted ok-bg">EXCELLENT DECISION</span>');
        t.print(`Let's talk: <a class="ext" href="mailto:${esc(CV.contact.email)}?subject=Let's%20work%20together">${esc(CV.contact.email)}</a> · ${t.link(CV.contact.linkedin, 'LinkedIn')} · ${t.cmd('gui', 'printable résumé')}`);
      }
    });

    H('true', { desc: 'do nothing, successfully', run: () => 0 });
    H('false', { desc: 'do nothing, unsuccessfully', run: () => 1 });
    H('xyzzy', { desc: 'magic', run() { t.printText('Nothing happens.'); } });
    H('42', { desc: 'the answer', run() { t.printText('The answer to life, the universe, and everything. But what is the question?'); } });
    H('hello', { desc: 'say hi', run() { t.print(`Hello, friend! 👋 Start with ${t.cmd('about')} or ${t.cmd('help')}.`); } });
    t.alias('hi', 'hello');
    H('party', { desc: 'party mode', run() { FUN.party(); t.printText('🎉 party mode (6 seconds of joy)'); } });
    H('flag', { desc: 'submit a flag', run(args) {
      if (args[0] === window.VFS.FLAG) { FUN.unlock('cracker'); t.printText('Correct! 🚩', 'ok'); return 0; }
      t.printText('flag: wrong (or missing) flag. Hint: look for hidden things in ~', 'err'); return 1;
    } });

    // aliases from ~/.mshrc
    t.alias('ll', 'ls -la');
    t.alias('la', 'ls -a');
    t.alias('l', 'ls');
    t.alias('cls', 'clear');
    t.alias('h', 'help');
    t.alias('cv', 'gui');
    t.alias('resume', 'gui');
    t.alias('startx', 'gui');
    t.alias('cmatrix', 'matrix');

    t.vfs.addBin([...t.commands.keys()]);
  }

  window.COMMANDS = { register, THEMES, renderFile };
})();
