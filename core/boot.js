/* Boot sequence and welcome screen (Portfolio.boot). Text comes from content/profile.js and site.config.js. */
(function () {
  'use strict';
  const { store, esc } = Portfolio.util;

  const wait = ms => new Promise(r => setTimeout(r, ms));

  function welcome(t) {
    const cv = Portfolio.cv;
    const cfg = Portfolio.config.welcome || {};
    const art = cv.bannerArt || Portfolio.banner.render(cv.banner || cv.handle || cv.name);
    const cols = Math.max(...art.split('\n').map(l => l.length));
    t.print(`<pre class="banner" style="--banner-cols:${cols}">${esc(art)}</pre>`);
    t.print(`<span class="accent2">${esc(cv.title)}</span> <span class="dim">·</span> <span class="dim">${esc(cv.location)}</span>`);
    if (cv.tagline) t.print(`<span class="dim">${esc(cv.tagline)}</span>`);
    t.blank();
    t.print(esc(cfg.message || "Welcome to my interactive résumé. It's a (mostly) real shell — explore it like one."));
    const chips = (cfg.commands || ['help']).filter(c => t.isCommand(c.split(' ')[0]));
    t.print(`<div class="chips">${chips.map(c => t.cmd(c)).join('')}</div>`);
    if (t.isCommand('gui')) t.print(`<span class="dim">Not a terminal person? →</span> ${t.cmd('gui', 'open the classic résumé')}`);
    t.blank();
    const total = Portfolio.registry.achievements.length;
    t.print(`<span class="dim">Tab completes · ↑↓ history · → accepts suggestion${total ? ` · ${total} achievements are hidden in here 🏆 (${Portfolio.achievements.count()} found)` : ''}</span>`);
  }

  /**
   * quick: skip the BIOS part. prompt: false when the caller (e.g. `reboot`) prints the prompt itself.
   */
  async function boot(t, { quick = false, prompt = true } = {}) {
    const cv = Portfolio.cv;
    t.busy = true;
    let skip = false;
    const onSkip = () => { skip = true; };
    addEventListener('keydown', onSkip, { once: true });
    addEventListener('pointerdown', onSkip, { once: true });
    const pause = async ms => { if (!skip) await wait(ms); };
    const out = (html, cls) => { if (!skip) t.print(html, cls); };

    const ok = s => `<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> ${esc(s)}`;
    const warn = s => `<span class="dim">[</span><span class="warn"> WARN </span><span class="dim">]</span> ${esc(s)}`;
    const k = (time, s) => `<span class="dim">[${time.toFixed(6).padStart(12)}]</span> ${esc(s)}`;
    const skillCount = (cv.skills || []).reduce((n, g) => n + g.items.length, 0);

    out('<span class="dim">press any key to skip</span>');
    if (!quick) {
      out('<span class="h">PortfolioBIOS v4.2</span>  (C) 2026 Curiosity Systems, Inc.');
      out('CPU: Human Brain v1 @ 3.60GHz (caffeine boost enabled)');
      const mem = t.print('Memory Test: 0K');
      for (let m = 0; m <= 16384 && !skip; m += 1024) { mem.textContent = `Memory Test: ${m}K`; await wait(25); }
      mem.textContent = 'Memory Test: 16384K OK';
      out('Detecting drives… <span class="ok">/dev/experience</span> <span class="ok">/dev/projects</span> <span class="ok">/dev/coffee</span>');
      await pause(250);
      out('Booting from /dev/brain1 …');
      await pause(350);
      out('');
      for (const [time, line] of [
        [0, `Linux version 6.9.0-coffee (${cv.handle}@portfolio) (gcc 14.2.1) #1 SMP PREEMPT_DYNAMIC`],
        [0.004213, 'Command line: BOOT_IMAGE=/vmlinuz root=/dev/brain ro quiet curiosity=max'],
        [0.112003, `Memory: 16384K/16384K available (${skillCount} skills reserved)`],
        [0.420000, 'random: crng init done (seeded with coffee beans)']
      ]) { out(k(time, line)); await pause(70); }
    }
    const units = [
      ok('Started Journal Service.'),
      ok('Mounted /home/guest.'),
      ok('Started Coffee Brewing Daemon (coffeed).'),
      ok('Reached target Network (offline, and proud of it).'),
      ok(`Loaded ${(cv.projects || []).length} projects into /home/guest/projects.`),
      ok(`Indexed ${(cv.experience || []).length} jobs and ${(cv.education || []).length} degrees.`),
      warn('imposter-syndrome.service: failed to start (ignored).'),
      ok(`Loaded ${t.commands.size} commands and ${Portfolio.registry.achievements.length} achievements.`),
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
      t.printText(`PortfolioOS 26.10 ${cv.handle}-portfolio tty1`);
      t.blank();
      const login = t.print(`${esc(cv.handle)}-portfolio login: `);
      for (const ch of 'guest') { login.textContent += ch; await wait(90); }
      t.print('Password: ');
      await wait(700);
    }
    t.printText(last ? `Last login: ${last} on tty1 — welcome back!` : 'Last login: never. First time here? Excellent.', 'dim');
    t.blank();
    welcome(t);
    t.typeahead = ''; // keys pressed to skip the boot or power on are not commands
    if (prompt) {
      t.busy = false;
      t.newPrompt();
    }
  }

  Portfolio.boot = { boot, welcome };
})();
