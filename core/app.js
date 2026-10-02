/* Startup: builds the filesystem and shell from the registries, applies themes, wires the window chrome. */
(function () {
  'use strict';
  const { store, esc } = Portfolio.util;
  const { registry } = Portfolio;

  const REQUIRED_CONTENT = ['name', 'fullName', 'handle', 'title', 'location', 'contact', 'about', 'skills', 'experience', 'projects', 'education', 'languages'];

  const kebab = s => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

  /** Turns every registered theme into a [data-theme="name"] block of CSS variables. */
  function injectThemes() {
    const css = [...registry.themes].map(([name, colours]) =>
      `[data-theme="${name}"] {\n${Object.entries(colours).map(([k, v]) => `  --${kebab(k)}: ${v};`).join('\n')}\n}`
    ).join('\n');
    const el = document.createElement('style');
    el.id = 'themes';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function themes() { return [...registry.themes.keys()]; }

  function setTheme(name) {
    if (!registry.themes.has(name)) throw new Error(`unknown theme "${name}"`);
    document.documentElement.dataset.theme = name;
    store.set('theme', name);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', registry.themes.get(name).bg);
  }

  function validateContent() {
    const missing = REQUIRED_CONTENT.filter(k => !(k in Portfolio.cv));
    if (missing.length) Portfolio.errors.push(`content is missing: ${missing.join(', ')} (see content/*.js)`);
  }

  function wireChrome(t) {
    const win = document.getElementById('window');
    document.getElementById('btn-close').addEventListener('click', () => { if (!t.busy && t.input && t.isCommand('exit')) t.runFromUI('exit'); });
    document.getElementById('btn-max').addEventListener('click', () => win.classList.toggle('maximized'));
    const dock = document.getElementById('dock');
    document.getElementById('btn-min').addEventListener('click', () => { win.classList.add('minimized'); dock.hidden = false; });
    dock.addEventListener('click', () => { win.classList.remove('minimized'); dock.hidden = true; t.focus(); });

    // Mobile quick-command bar, from site.config.js
    const bar = document.getElementById('quickbar');
    for (const cmd of (Portfolio.config.quickCommands || []).filter(c => t.isCommand(c.split(' ')[0]))) {
      const b = document.createElement('button');
      b.dataset.run = cmd;
      b.textContent = cmd;
      bar.appendChild(b);
    }
    document.getElementById('btn-gui').hidden = !t.isCommand('gui');
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-run]');
      if (!b) return;
      if (b.dataset.run === 'gui') Portfolio.gui.open();
      else t.runFromUI(b.dataset.run);
    });
  }

  async function start() {
    const cfg = Portfolio.config;
    injectThemes();
    validateContent();

    const saved = store.get('theme', null);
    const initial = registry.themes.has(saved) ? saved : registry.themes.has(cfg.theme) ? cfg.theme : themes()[0];
    if (initial) setTheme(initial);
    else Portfolio.errors.push('no themes loaded — list at least one in site.config.js');
    document.getElementById('window').classList.toggle('crt', store.get('crt', cfg.crt !== false));

    const vfs = new Portfolio.VFS(Portfolio.cv, cfg, registry.files);
    const t = new Portfolio.Terminal({ screen: document.getElementById('screen'), output: document.getElementById('output'), vfs });
    for (const def of registry.commands) t.register(def);
    for (const [name, expansion] of Object.entries(cfg.aliases || {})) t.alias(name, expansion);
    vfs.addBin([...t.commands.keys()]);
    Portfolio.term = t;

    for (const hook of registry.startHooks) {
      try { hook(t); }
      catch (err) { Portfolio.errors.push(`onStart hook failed: ${err.message}`); console.error('app: onStart hook failed', err); }
    }
    wireChrome(t);

    // ?noboot skips the boot animation, ?cmd=<command> runs a command once the prompt is ready.
    const params = new URLSearchParams(location.search);
    const mode = params.has('noboot') || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off'
      : cfg.boot === 'auto' || !cfg.boot ? (store.get('lastLogin', null) ? 'quick' : 'full') : cfg.boot;

    try {
      if (mode === 'off') Portfolio.boot.welcome(t);
      else await Portfolio.boot.boot(t, { quick: mode === 'quick', prompt: false });
    } catch (err) {
      console.error('app: boot failed', err);
      Portfolio.errors.push(`boot failed: ${err.message}`);
      t.clear();
      Portfolio.boot.welcome(t);
    }

    if (Portfolio.errors.length) {
      t.blank();
      t.print('<span class="err">⚠ Some modules have problems (see also the browser console):</span>');
      for (const e of Portfolio.errors) t.print(`<span class="err">  • ${esc(e)}</span>`);
    }
    t.busy = false;
    t.newPrompt();
    if (params.get('cmd')) t.runFromUI(params.get('cmd'));
  }

  Portfolio.app = { start, setTheme, themes };
})();
