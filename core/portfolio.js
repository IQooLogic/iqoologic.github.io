/*
 * Portfolio core: the global namespace, the registries every module writes to,
 * shared helpers, and the loader that reads site.config.js and loads everything.
 *
 * Every other file talks to the site only through `Portfolio`:
 *   Portfolio.content({...})          add CV data            (content/*.js)
 *   Portfolio.theme(name, colours)    add a colour theme     (themes/*.js)
 *   Portfolio.command({...})          add a shell command    (commands/**.js)
 *   Portfolio.achievement({...})      add an achievement
 *   Portfolio.file(path, content)     add a file to the virtual filesystem
 *   Portfolio.dir(path, opts)         add a directory
 *   Portfolio.guiSection(name, {...}) add or replace a section of the GUI résumé
 *   Portfolio.style(css)              add CSS that belongs to a module
 *   Portfolio.onStart(fn)             run fn(terminal) once the shell exists
 */
(function () {
  'use strict';

  // Engine files, always loaded first and in this order. You should not need to touch these.
  const CORE = [
    'core/fs.js',
    'core/terminal.js',
    'core/effects.js',
    'core/banner.js',
    'core/gui.js',
    'core/boot.js',
    'core/app.js'
  ];

  const THEME_KEYS = ['bg', 'bg2', 'bar', 'fg', 'dim', 'accent', 'accent2', 'ok', 'warn', 'err', 'cyan', 'sel', 'glow', 'wall1', 'wall2', 'wall3'];

  /* ── helpers ────────────────────────────────────────── */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('msh:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (err) {
        console.warn(`portfolio: storage read failed for "${key}"`, err);
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem('msh:' + key, JSON.stringify(value)); }
      catch (err) { console.warn(`portfolio: storage write failed for "${key}"`, err); }
    }
  };

  /** Segmented bar drawn with CSS so it lines up in any font. */
  function meter(percent, widthCh = 24) {
    return `<span class="meter" style="width:${widthCh}ch"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></span>`;
  }

  function htmlToText(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent;
  }

  function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }

  function wrap(text, width) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/)) {
        if (line && (line + ' ' + word).length > width) { out.push(line); line = word; }
        else line = line ? line + ' ' + word : word;
      }
      out.push(line);
    }
    return out;
  }

  /** Markdown-lite colouring used by `cat` and `projects`. */
  function renderText(text, name) {
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

  const yearsCoding = () => new Date().getFullYear() - (Portfolio.cv.startedCoding || new Date().getFullYear());

  /* ── registries ─────────────────────────────────────── */
  const errors = [];
  const source = () => (document.currentScript && document.currentScript.getAttribute('src')) || 'unknown module';
  const fail = msg => { errors.push(msg); console.error('portfolio: ' + msg); };

  const registry = { commands: [], achievements: [], themes: new Map(), guiSections: new Map(), files: [], startHooks: [] };

  const Portfolio = {
    cv: {},
    config: {},
    errors,
    registry,
    util: { esc, store, meter, htmlToText, levenshtein, wrap, renderText, yearsCoding },

    content(data) {
      for (const [key, value] of Object.entries(data)) {
        if (key in this.cv) fail(`${source()}: content "${key}" is defined twice`);
        this.cv[key] = value;
      }
    },

    theme(name, colours) {
      const missing = THEME_KEYS.filter(k => !(k in colours));
      if (missing.length) fail(`${source()}: theme "${name}" is missing: ${missing.join(', ')}`);
      if (registry.themes.has(name)) fail(`${source()}: theme "${name}" is defined twice`);
      registry.themes.set(name, colours);
    },

    command(def) {
      if (!def || !def.name || typeof def.run !== 'function') { fail(`${source()}: command needs at least { name, run }`); return; }
      const dup = registry.commands.find(c => c.name === def.name);
      if (dup) fail(`${source()}: command "${def.name}" is already defined in ${dup.source}`);
      registry.commands.push({ ...def, source: source() });
    },

    achievement(def) {
      if (!def || !def.id || !def.title) { fail(`${source()}: achievement needs { id, title, desc, hint }`); return; }
      if (registry.achievements.some(a => a.id === def.id)) fail(`${source()}: achievement "${def.id}" is defined twice`);
      registry.achievements.push(def);
    },

    /** { title, render(cv, helpers) => html }. Replacing a built-in section is allowed; defining a custom one twice is not. */
    guiSection(name, def) {
      if (!def || typeof def.render !== 'function') { fail(`${source()}: GUI section "${name}" needs { title, render }`); return; }
      const existing = registry.guiSections.get(name);
      if (existing && !existing.builtin) fail(`${source()}: GUI section "${name}" is defined twice`);
      registry.guiSections.set(name, def);
    },

    /** content: a string, or a function (cv) => string evaluated when the file is read. */
    file(path, content, opts = {}) { registry.files.push({ path, type: 'file', content, ...opts }); },
    dir(path, opts = {}) { registry.files.push({ path, type: 'dir', ...opts }); },

    style(css) {
      const el = document.createElement('style');
      el.dataset.module = source();
      el.textContent = css;
      document.head.appendChild(el);
    },

    onStart(fn) { registry.startHooks.push(fn); },

    /** Called by site.config.js. Loads every module listed there, then starts the app. */
    configure(config) {
      this.config = config;
      const list = [
        ...CORE,
        ...(config.content || []).map(n => `content/${n}.js`),
        ...(config.themes || []).map(n => `themes/${n}.js`),
        ...(config.commands || []).map(n => `commands/${n}.js`)
      ];
      if (config.description) document.querySelector('meta[name="description"]').setAttribute('content', config.description);

      // Scripts run in list order, so an error belongs to the first module that has not finished loading.
      // (Pages opened from file:// hide error details as "Script error.", so naming the file matters.)
      let executed = 0;
      const onError = e => {
        const file = list[executed] || 'unknown module';
        const detail = e.message && e.message !== 'Script error.' ? `line ${e.lineno}: ${e.message}` : 'it threw an error (open the browser console for details)';
        fail(`${file}: ${detail}`);
      };
      addEventListener('error', onError);

      // async=false: download in parallel, execute in list order.
      const loads = list.map(src => new Promise(resolve => {
        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = () => { executed++; resolve(); };
        s.onerror = () => { executed++; fail(`could not load ${src} — is it listed in site.config.js but missing on disk?`); resolve(); };
        document.head.appendChild(s);
      }));

      Promise.all(loads).then(() => {
        removeEventListener('error', onError);
        if (!this.app) { showFatal(); return; }
        document.title = config.title || `${this.cv.fullName || 'Terminal'} — Terminal Portfolio`;
        this.app.start();
      });
    }
  };

  function showFatal() {
    const box = document.createElement('pre');
    box.className = 'fatal';
    box.textContent = 'The portfolio could not start:\n\n' + errors.map(e => '  • ' + e).join('\n');
    document.body.appendChild(box);
  }

  window.Portfolio = Portfolio;
})();
