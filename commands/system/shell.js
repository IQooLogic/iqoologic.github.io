/* Shell builtins: echo, env, export, alias, which, true, false. */
Portfolio.command({
  name: 'echo',
  group: 'System',
  desc: 'print text ($VARS expand)',
  run(args, t) { t.printText(args.join(' ')); },
  filter: (input, args) => args.join(' ')
});

Portfolio.command({
  name: 'env',
  group: 'System',
  desc: 'environment variables',
  aliases: ['printenv'],
  run(args, t) { t.print(Object.entries(t.env).map(([k, v]) => `<span class="accent">${t.esc(k)}</span>=${t.esc(v)}`).join('\n')); },
  filter: () => Object.entries(Portfolio.term.env).map(([k, v]) => `${k}=${v}`).join('\n')
});

Portfolio.command({
  name: 'export',
  group: 'System',
  desc: 'set a variable: export NAME=value',
  run(args, t) {
    for (const a of args) {
      const m = a.match(/^([A-Za-z_]\w*)=(.*)$/);
      if (!m) { t.printText(`export: not a valid identifier: ${a}`, 'err'); return 1; }
      t.env[m[1]] = m[2];
    }
  }
});

Portfolio.command({
  name: 'alias',
  group: 'System',
  desc: 'list or define aliases',
  run(args, t) {
    if (!args.length) { t.print(Object.entries(t.aliases).map(([k, v]) => `alias <span class="accent">${t.esc(k)}</span>='${t.esc(v)}'`).join('\n')); return; }
    const m = args.join(' ').match(/^([\w.-]+)=(.+)$/);
    if (!m) { t.printText("usage: alias name='command'", 'err'); return 1; }
    t.alias(m[1], m[2]);
  }
});

Portfolio.command({
  name: 'which',
  group: 'System',
  desc: 'locate a command',
  run(args, t) {
    for (const a of args) {
      if (t.aliases[a]) t.printText(`${a}: aliased to ${t.aliases[a]}`);
      else if (t.commands.has(a)) t.printText(`/bin/${a}`);
      else { t.printText(`${a} not found`, 'err'); return 1; }
    }
  }
});

Portfolio.command({ name: 'true', hidden: true, desc: 'do nothing, successfully', run: () => 0 });
Portfolio.command({ name: 'false', hidden: true, desc: 'do nothing, unsuccessfully', run: () => 1 });
