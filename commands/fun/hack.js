/* hack — Hollywood hacking, then an honest pitch. */
Portfolio.achievement({ id: 'hacker', title: '1337 h4x0r', desc: 'Hacked the mainframe', hint: 'Every movie hacker types one word. `hack`.' });

Portfolio.command({
  name: 'hack',
  hidden: true,
  desc: 'hack the mainframe',
  async run(args, t) {
    const target = args[0] || 'recruiter-mainframe.local';
    t.print(`<span class="err">[*]</span> msh-sploit v6.6.6 — target: <b>${t.esc(target)}</b>`);
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
    t.unlock('hacker');
    await t.sleep(800);
    t.print(`<span class="dim">Relax — nothing was hacked. That was pure Hollywood.\nReal security work is quieter: threat models, packet captures, and good logs.\nIf you need someone who knows what real attacks look like (and how to stop them): </span>${t.cmd('contact')}`);
  }
});
