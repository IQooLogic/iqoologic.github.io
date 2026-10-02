/* Boot sequence, welcome screen and window chrome. */
(function () {
  'use strict';
  const { Terminal, store, esc } = window.MSH;
  const CV = window.CV;
  const FUN = window.FUN;

  const BANNER = [
    '███╗   ███╗██╗██╗      ██████╗ ███████╗',
    '████╗ ████║██║██║     ██╔═══██╗██╔════╝',
    '██╔████╔██║██║██║     ██║   ██║███████╗',
    '██║╚██╔╝██║██║██║     ██║   ██║╚════██║',
    '██║ ╚═╝ ██║██║███████╗╚██████╔╝███████║',
    '╚═╝     ╚═╝╚═╝╚══════╝ ╚═════╝ ╚══════╝'
  ].join('\n').replace(/[╗╔╝╚║═]/g, ' '); // keep only the solid blocks; the shadow is drawn in CSS

  const wait = ms => new Promise(r => setTimeout(r, ms));

  function setTheme(name) {
    document.documentElement.dataset.theme = name;
    store.set('theme', name);
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]').setAttribute('content', bg);
  }

  function welcome(t) {
    t.print(`<pre class="banner">${esc(BANNER)}</pre>`);
    t.print(`<span class="accent2">${esc(CV.title)}</span> <span class="dim">·</span> <span class="dim">${esc(CV.location)}</span>`);
    t.print(`<span class="dim">${esc(CV.tagline)}</span>`);
    t.blank();
    t.print("Welcome to my interactive résumé. It's a (mostly) real shell — explore it like one.");
    t.print(`<div class="chips">${['help', 'about', 'skills', 'experience', 'projects', 'contact', 'neofetch'].map(c => t.cmd(c)).join('')}</div>`);
    t.print(`<span class="dim">Not a terminal person? →</span> ${t.cmd('gui', 'open the classic résumé')}`);
    t.blank();
    t.print(`<span class="dim">Tab completes · ↑↓ history · → accepts suggestion · ${FUN.ACHIEVEMENTS.length} achievements are hidden in here 🏆 (${FUN.unlocked.size} found)</span>`);
  }

  /* ── boot ───────────────────────────────────────────── */
  async function boot(t, { quick = false, prompt = true } = {}) {
    t.busy = true;
    let skip = false;
    const onSkip = () => { skip = true; };
    addEventListener('keydown', onSkip, { once: true });
    addEventListener('pointerdown', onSkip, { once: true });
    const pause = async ms => { if (!skip) await wait(ms); };
    const out = (html, cls) => { if (!skip) t.print(html, cls); };

    const ok = s => `<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> ${s}`;
    const warn = s => `<span class="dim">[</span><span class="warn"> WARN </span><span class="dim">]</span> ${s}`;
    const k = (time, s) => `<span class="dim">[${time.toFixed(6).padStart(12)}]</span> ${s}`;

    out('<span class="dim">press any key to skip</span>');
    if (!quick) {
      out('<span class="h">PortfolioBIOS v4.2</span>  (C) 2026 Curiosity Systems, Inc.');
      out(`CPU: Human Brain v1 @ 3.60GHz (caffeine boost enabled)`);
      const mem = t.print('Memory Test: 0K');
      for (let m = 0; m <= 16384 && !skip; m += 1024) { mem.textContent = `Memory Test: ${m}K`; await wait(25); }
      mem.textContent = 'Memory Test: 16384K OK';
      out('Detecting drives… <span class="ok">/dev/experience</span> <span class="ok">/dev/projects</span> <span class="ok">/dev/coffee</span>');
      await pause(250);
      out('Booting from /dev/brain1 …');
      await pause(350);
      out('');
      out(k(0, 'Linux version 6.9.0-coffee (milos@portfolio) (gcc 14.2.1) #1 SMP PREEMPT_DYNAMIC'));
      await pause(60);
      out(k(0.004213, 'Command line: BOOT_IMAGE=/vmlinuz root=/dev/brain ro quiet curiosity=max'));
      await pause(60);
      out(k(0.112003, `Memory: 16384K/16384K available (${CV.skills.reduce((n, g) => n + g.items.length, 0)} skills reserved)`));
      await pause(60);
      out(k(0.420000, 'random: crng init done (seeded with coffee beans)'));
      await pause(120);
    }
    const units = [
      ok('Started Journal Service.'),
      ok('Mounted /home/guest.'),
      ok('Started Coffee Brewing Daemon (coffeed).'),
      ok('Reached target Network (offline, and proud of it).'),
      ok(`Loaded ${CV.projects.length} projects into /home/guest/projects.`),
      ok(`Indexed ${CV.experience.length} jobs and ${CV.education.length} degrees.`),
      warn('imposter-syndrome.service: failed to start (ignored).'),
      ok('Started Easter Egg Scheduler.'),
      ok('Started msh — the portfolio shell.'),
      ok('Reached target Graphical Interface (just kidding, it is a terminal).')
    ];
    for (const u of units) { out(u); await pause(quick ? 40 : 90 + Math.random() * 110); }
    await pause(400);

    removeEventListener('keydown', onSkip);
    removeEventListener('pointerdown', onSkip);
    t.clear();

    const last = store.get('lastLogin', null);
    store.set('lastLogin', new Date().toString().slice(0, 24));
    if (!skip) {
      t.printText(`PortfolioOS 26.10 ${CV.handle}-portfolio tty1`);
      t.blank();
      const login = t.print(`${esc(CV.handle)}-portfolio login: `);
      for (const ch of 'guest') { login.textContent += ch; await wait(90); }
      t.print('Password: ');
      await wait(700);
    }
    t.printText(last ? `Last login: ${last} on tty1 — welcome back!` : `Last login: never. First time here? Excellent.`, 'dim');
    t.blank();
    welcome(t);
    t.typeahead = ''; // keys pressed to skip the boot or power on are not commands
    if (prompt) {
      t.busy = false;
      t.newPrompt();
    }
  }

  /* ── shutdown / reboot ─────────────────────────────── */
  async function shutdown(t, { reboot = false } = {}) {
    for (const s of ['Stopping msh — the portfolio shell…', 'Stopping Coffee Brewing Daemon… (reluctantly)', 'Unmounting /home/guest…', reboot ? 'Rebooting.' : 'Reached target Power-Off.']) {
      t.print(`<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> ${esc(s)}`);
      await t.sleep(220);
    }
    await t.sleep(300);
    if (!reboot) await FUN.powerOff();
    else {
      document.getElementById('window').classList.add('poweroff');
      await wait(1100);
      document.getElementById('window').classList.remove('poweroff');
    }
    FUN.unlock('power');
    t.clear();
    t.cwd = t.env.HOME;
    // submit() owns the prompt here: it prints a fresh one once this command returns.
    await boot(t, { quick: true, prompt: false });
  }

  /* ── rm -rf / ──────────────────────────────────────── */
  async function nuke(t) {
    FUN.unlock('destroyer');
    const paths = [];
    const walk = (node, path) => {
      for (const [n, c] of Object.entries(node.children || {})) {
        const p = `${path}/${n}`;
        if (c.type === 'dir') walk(c, p);
        paths.push(p);
      }
    };
    walk(t.vfs.root, '');
    for (const p of paths) { t.printText(`removed '${p}'`, 'err'); await t.sleep(18); }
    const win = document.getElementById('window');
    win.classList.add('shake');
    await t.sleep(600);
    win.classList.remove('shake');
    t.clear();
    t.print('<span class="err">Kernel panic - not syncing: Attempted to kill init! exitcode=0x0000dead</span>');
    t.print(`<span class="dim">CPU: 0 PID: 1 Comm: msh Not tainted 6.9.0-coffee #1\nCall Trace:\n  &lt;TASK&gt;\n  dump_stack+0x42/0x1337\n  panic+0xdead/0xbeef\n  do_exit+0x2a/0xb0\n  rm_rf_slash+0xff/0xff [career]\n  &lt;/TASK&gt;\n---[ end Kernel panic - not syncing ]---</span>`);
    await t.sleep(2600);
    t.clear();
    t.print('<span class="ok">…just kidding.</span> 😄 Nothing was deleted — this filesystem is read-only.');
    t.print(`<span class="dim">Good instinct to test destructive commands in a sandbox, though. That's the security mindset. → </span>${t.cmd('about')}`);
    return 0;
  }

  /* ── init ───────────────────────────────────────────── */
  function init() {
    const theme = store.get('theme', 'midnight');
    if (window.COMMANDS.THEMES.includes(theme)) setTheme(theme);
    const win = document.getElementById('window');
    win.classList.toggle('crt', store.get('crt', true));

    const vfs = new window.VFS(CV);
    const t = new Terminal({ screen: document.getElementById('screen'), output: document.getElementById('output'), vfs });
    window.COMMANDS.register(t);
    window.APP.term = t;

    // Window chrome
    document.getElementById('btn-close').addEventListener('click', () => { if (!t.busy && t.input) t.runFromUI('exit'); });
    document.getElementById('btn-max').addEventListener('click', () => win.classList.toggle('maximized'));
    const dock = document.getElementById('dock');
    document.getElementById('btn-min').addEventListener('click', () => { win.classList.add('minimized'); dock.hidden = false; });
    dock.addEventListener('click', () => { win.classList.remove('minimized'); dock.hidden = true; t.focus(); });
    document.querySelectorAll('[data-run]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.run === 'gui') { window.GUI.open(); FUN.unlock('recruiter'); return; }
      t.runFromUI(b.dataset.run);
    }));

    // ?noboot skips the boot animation, ?cmd=<command> runs a command once the prompt is ready.
    const params = new URLSearchParams(location.search);
    const start = async () => {
      if (params.has('noboot') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        welcome(t);
        t.newPrompt();
      } else {
        await boot(t, { quick: Boolean(store.get('lastLogin', null)) });
      }
      if (params.get('cmd')) t.runFromUI(params.get('cmd'));
    };
    start().catch(err => {
      console.error('main: boot failed', err);
      t.busy = false;
      t.clear();
      welcome(t);
      t.newPrompt();
    });
  }

  window.APP = { welcome, setTheme, shutdown, nuke, boot, term: null };
  document.addEventListener('DOMContentLoaded', init);
})();
