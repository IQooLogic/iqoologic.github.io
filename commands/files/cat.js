/* cat — print files (markdown-lite colouring for .md/.txt). Emits t.emit('cat', path). */
Portfolio.command({
  name: 'cat',
  group: 'Files',
  desc: 'print a file',
  aliases: ['less', 'more', 'bat'],
  filter: input => input,
  run(args, t) {
    if (!args.length) { t.printText('cat: missing file operand. try: cat about.txt', 'err'); return 1; }
    let status = 0;
    for (const a of args) {
      const text = t.readFile(a, 'cat');
      if (text === null) { status = 1; continue; }
      const { node, path } = t.vfs.resolve(a, t.cwd);
      t.print(Portfolio.util.renderText(text, a), node.binary ? 'binary' : '');
      t.emit('cat', path);
    }
    return status;
  }
});
