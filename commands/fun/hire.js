/* hire and ~/hire-me.sh — confetti and your contact details. */
Portfolio.achievement({ id: 'hire', title: 'Excellent Decision', desc: 'Ran hire-me.sh', hint: 'There is an executable script in ~.' });

Portfolio.file('~/hire-me.sh', '#!/bin/msh\n# Usage: ./hire-me.sh\n# Best script in this directory. Possibly in the world.\nhire --now', { exec: 'hire' });

Portfolio.command({
  name: 'hire',
  hidden: true,
  desc: 'the best decision you will make today',
  async run(args, t) {
    const { cv, esc } = t;
    t.unlock('hire');
    await t.progress('📄 compiling résumé', 500, 16);
    await t.progress('🤝 preparing handshake', 500, 16);
    t.fx.confetti(180);
    t.print('<span class="granted">EXCELLENT DECISION</span>');
    const links = [`<a class="ext" href="mailto:${esc(cv.contact.email)}?subject=Let's%20work%20together">${esc(cv.contact.email)}</a>`];
    if (cv.contact.linkedin) links.push(t.link(cv.contact.linkedin, 'LinkedIn'));
    if (t.isCommand('gui')) links.push(t.cmd('gui', 'printable résumé'));
    t.print(`Let's talk: ${links.join(' · ')}`);
  }
});
