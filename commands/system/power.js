/* exit / reboot — CRT power-off animation, then a quick boot. */
(function () {
  Portfolio.achievement({ id: 'power', title: 'Have You Tried Turning It Off?', desc: 'Rebooted the system', hint: 'The classic IT fix. `reboot`.' });

  async function shutdown(t, reboot) {
    for (const s of ['Stopping msh — the portfolio shell…', 'Stopping Coffee Brewing Daemon… (reluctantly)', 'Unmounting /home/guest…', reboot ? 'Rebooting.' : 'Reached target Power-Off.']) {
      t.print(`<span class="dim">[</span><span class="ok">  OK  </span><span class="dim">]</span> ${t.esc(s)}`);
      await t.sleep(220);
    }
    await t.sleep(300);
    const win = document.getElementById('window');
    if (reboot) {
      win.classList.add('poweroff');
      await new Promise(r => setTimeout(r, 1100));
      win.classList.remove('poweroff');
    } else {
      await t.fx.powerOff();
    }
    t.unlock('power');
    t.clear();
    t.cwd = t.env.HOME;
    // The shell prints a fresh prompt once this command returns.
    await Portfolio.boot.boot(t, { quick: true, prompt: false });
  }

  Portfolio.command({
    name: 'exit',
    group: 'System',
    desc: 'shut down (try it)',
    aliases: ['logout', 'shutdown', 'poweroff', 'halt'],
    run: (args, t) => shutdown(t, false)
  });

  Portfolio.command({
    name: 'reboot',
    group: 'System',
    desc: 'turn it off and on again',
    run: (args, t) => shutdown(t, true)
  });
})();
