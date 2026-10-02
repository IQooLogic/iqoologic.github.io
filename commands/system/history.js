/* history — numbered command history (stored in this browser). */
Portfolio.command({
  name: 'history',
  group: 'System',
  desc: 'command history (-c to clear)',
  run(args, t) {
    if (args.includes('-c')) {
      t.history = [];
      t.store.set('history', []);
      t.printText('history cleared. (the NSA still has a copy)', 'dim');
      return;
    }
    t.print(t.history.map((h, i) => `<span class="dim">${String(i + 1).padStart(4)}</span>  ${t.esc(h)}`).join('\n'));
  },
  filter: () => Portfolio.term.history.join('\n')
});
