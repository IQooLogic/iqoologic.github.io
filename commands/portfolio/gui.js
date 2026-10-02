/* gui — opens the classic, printable résumé (core/gui.js). Also adds ~/resume.pdf as a hint. */
Portfolio.achievement({ id: 'recruiter', title: 'Talent Scout', desc: 'Opened the GUI résumé', hint: 'Not a terminal person? There is a GUI.' });

Portfolio.command({
  name: 'gui',
  group: 'Portfolio',
  desc: 'classic résumé view (printable / PDF)',
  aliases: ['cv', 'resume', 'startx'],
  run(args, t) {
    Portfolio.gui.open();
    t.printText('Opening the GUI résumé… (Esc to come back)', 'dim');
  }
});

// The titlebar GUI button opens it without the command, so unlock on the event instead.
document.addEventListener('portfolio:gui-open', () => Portfolio.achievements.unlock('recruiter'));

Portfolio.file('~/resume.pdf', '%PDF-1.7\n%âãÏÓ\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\nÿØÿà\u0000\u0010JFIF\u0000\u0001\u0001\u0000\u0000\u0001\u0000\u0001...\n\n(binary gibberish — your terminal is not a PDF viewer)\nhint: run `gui` for a human-friendly, printable résumé.', { binary: true });
