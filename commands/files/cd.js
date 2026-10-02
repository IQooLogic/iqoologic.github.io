/* cd and pwd. cd emits t.emit('cd', path). */
Portfolio.command({
  name: 'cd',
  group: 'Files',
  desc: 'change directory',
  run(args, t) {
    let target = args[0] || '~';
    if (target === '-') target = t.prevCwd;
    const { node, path, denied } = t.vfs.resolve(target, t.cwd);
    if (denied || (node && node.locked)) { t.printText(`cd: permission denied: ${target}`, 'err'); return 1; }
    if (!node) { t.printText(`cd: no such file or directory: ${target}`, 'err'); return 1; }
    if (node.type !== 'dir') { t.printText(`cd: not a directory: ${target}`, 'err'); return 1; }
    t.prevCwd = t.cwd;
    t.cwd = path;
    t.emit('cd', path);
    return 0;
  }
});

Portfolio.command({
  name: 'pwd',
  group: 'Files',
  desc: 'print working directory',
  run(args, t) { t.printText(t.cwd); },
  filter: () => Portfolio.term.cwd
});
