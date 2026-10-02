/* rm and friends — the filesystem is read-only. `rm -rf /` gets a fake kernel panic. */
(function () {
  Portfolio.achievement({ id: 'destroyer', title: 'Chaos Agent', desc: 'Tried to delete everything', hint: 'The most dangerous command in Unix. Go on, it is fake.' });

  async function nuke(t) {
    t.unlock('destroyer');
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
    t.print('<span class="dim">CPU: 0 PID: 1 Comm: msh Not tainted 6.9.0-coffee #1\nCall Trace:\n  &lt;TASK&gt;\n  dump_stack+0x42/0x1337\n  panic+0xdead/0xbeef\n  do_exit+0x2a/0xb0\n  rm_rf_slash+0xff/0xff [career]\n  &lt;/TASK&gt;\n---[ end Kernel panic - not syncing ]---</span>');
    await t.sleep(2600);
    t.clear();
    t.print('<span class="ok">…just kidding.</span> 😄 Nothing was deleted — this filesystem is read-only.');
    t.print(`<span class="dim">Good instinct to test destructive commands in a sandbox, though. That's the security mindset. → </span>${t.cmd('about')}`);
    return 0;
  }

  const isRecursiveForce = a => /^-\w*r\w*f|^-\w*f\w*r/.test(a);
  const isEverything = a => ['/', '/*', '~', '*', '.'].includes(a);

  for (const name of ['rm', 'mv', 'cp', 'mkdir', 'touch', 'chmod', 'chown', 'rmdir']) {
    Portfolio.command({
      name,
      group: 'Files',
      hidden: name !== 'rm',
      desc: name === 'rm' ? 'remove files (careful…)' : 'read-only, sorry',
      async run(args, t) {
        if (name === 'rm' && args.some(isRecursiveForce) && args.some(isEverything)) return nuke(t);
        if (!args.length) { t.printText(`${name}: missing operand`, 'err'); return 1; }
        t.printText(`${name}: cannot modify '${args.filter(a => !a.startsWith('-')).join(' ') || '.'}': Read-only file system (my CV is immutable, like a good audit log)`, 'err');
        return 1;
      }
    });
  }
})();
