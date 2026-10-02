/* tree — directory tree (-a shows hidden files). */
Portfolio.command({
  name: 'tree',
  group: 'Files',
  desc: 'show the directory tree',
  run(args, t) {
    const label = Portfolio.VFS.label;
    const all = args.includes('-a');
    const target = args.find(a => !a.startsWith('-')) || '.';
    const { node } = t.vfs.resolve(target, t.cwd);
    if (!node || node.type !== 'dir') { t.printText(`tree: ${target}: not a directory`, 'err'); return 1; }
    let dirs = 0, files = 0;
    const walk = (n, prefix) => Object.entries(n.children)
      .filter(([k]) => all || !k.startsWith('.'))
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([k, c], i, arr) => {
        const last = i === arr.length - 1;
        const line = `<span class="dim">${prefix}${last ? '└── ' : '├── '}</span>${label(k, c)}`;
        if (c.type === 'dir') { dirs++; return [line, ...(c.locked ? [] : walk(c, prefix + (last ? '    ' : '│   ')))]; }
        files++;
        return [line];
      });
    const lines = walk(node, '');
    t.print([`<span class="dir">${t.esc(target)}</span>`, ...lines, '', `<span class="dim">${dirs} directories, ${files} files</span>`].join('\n'));
  }
});
