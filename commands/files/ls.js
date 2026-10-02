/* ls — list a directory. Emits t.emit('ls', { path, all }) so other modules can react. */
Portfolio.command({
  name: 'ls',
  group: 'Files',
  desc: 'list directory contents (-a, -l)',
  aliases: ['dir'],
  run(args, t) {
    const { esc } = t;
    const label = Portfolio.VFS.label;
    const flags = args.filter(a => a.startsWith('-')).join('');
    const targets = args.filter(a => !a.startsWith('-'));
    const all = flags.includes('a'), long = flags.includes('l');
    let status = 0;
    for (const target of targets.length ? targets : ['.']) {
      const { node, path, denied } = t.vfs.resolve(target, t.cwd);
      if (denied || (node && node.locked)) { t.printText(`ls: cannot open directory '${target}': Permission denied`, 'err'); status = 2; continue; }
      if (!node) { t.printText(`ls: cannot access '${target}': No such file or directory`, 'err'); status = 2; continue; }
      if (targets.length > 1) t.print(`<span class="h">${esc(target)}:</span>`);
      const entries = node.type === 'dir' ? Object.entries(node.children) : [[target, node]];
      const visible = entries.filter(([n]) => all || !n.startsWith('.')).sort(([a], [b]) => a.localeCompare(b));
      if (long) {
        const rows = (all ? [['.', node], ['..', { type: 'dir' }]] : []).concat(visible).map(([n, c]) => {
          const perm = c.type === 'dir' ? 'drwxr-xr-x' : c.exec ? '-rwxr-xr-x' : c.locked ? '-rw-------' : '-rw-r--r--';
          const size = c.type === 'dir' ? 4096 : (t.vfs.read(c) || '').length;
          return `<span class="dim">${perm}  guest guest ${String(size).padStart(6)}  Oct  2 13:37</span>  ${label(n, c)}`;
        });
        t.print(`<span class="dim">total ${visible.length * 4}</span>\n${rows.join('\n')}`);
      } else if (visible.length) {
        t.print(`<div class="ls-grid">${visible.map(([n, c]) => `<span>${label(n, c)}</span>`).join('')}</div>`);
      }
      t.emit('ls', { path, all, node });
    }
    return status;
  }
});
