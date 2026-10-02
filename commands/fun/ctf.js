/*
 * Capture the flag: a hidden ~/.secret directory with a base64-encoded flag.
 * Change FLAG to whatever you like; the encoded file is generated from it.
 */
(function () {
  const FLAG = 'flag{curiosity_is_a_security_skill}';

  Portfolio.achievement({ id: 'curious', title: 'Curious Cat', desc: 'Found the hidden directory', hint: 'Dotfiles are hidden by default. `ls -a` shows them.' });
  Portfolio.achievement({ id: 'cracker', title: 'Code Breaker', desc: 'Captured the flag', hint: 'Something in ~/.secret is encoded…' });

  Portfolio.file('~/.secret/README', 'You found the hidden directory. Curiosity: +1.\n\nThe flag is base64-encoded. A security person would know what to do:\n\n    base64 -d ~/.secret/flag.b64\n');
  Portfolio.file('~/.secret/flag.b64', btoa(FLAG));

  function captured(t) {
    t.unlock('cracker');
    t.fx.confetti(120);
    t.print('<span class="ok">🎉 Flag captured.</span> <span class="dim">Curiosity is the #1 security skill — that is why I have it on my CV.</span>');
  }

  Portfolio.onStart(t => {
    const secret = path => path.includes('/.secret');
    t.on('ls', ({ path, all }) => {
      if (all && path === Portfolio.VFS.HOME) t.unlock('curious');
      if (!all && path === Portfolio.VFS.HOME && !t.store.get('ls-hint', false)) {
        t.store.set('ls-hint', true);
        t.print('<span class="dim">(some files are hidden… real hackers know the flag)</span>');
      }
    });
    t.on('cd', path => { if (secret(path)) t.unlock('curious'); });
    t.on('cat', path => { if (secret(path)) t.unlock('curious'); });
    t.on('decoded', text => { if (text.trim() === FLAG) captured(t); });
  });

  Portfolio.command({
    name: 'flag',
    hidden: true,
    desc: 'submit a flag',
    run(args, t) {
      if (args[0] === FLAG) { captured(t); return 0; }
      t.printText('flag: wrong (or missing) flag. Hint: look for hidden things in ~', 'err');
      return 1;
    }
  });
})();
