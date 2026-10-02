/* coffee — brews a cup. */
Portfolio.command({
  name: 'coffee',
  hidden: true,
  desc: 'brew a cup',
  async run(args, t) {
    const cup = String.raw`
      ( (
       ) )
    ........
    |      |]
    \      /
     '----'`;
    await t.progress('☕ grinding beans', 600, 16);
    await t.progress('☕ brewing', 900, 16);
    t.print(`<span class="pre warn">${t.esc(cup)}</span>`);
    t.printText('Here you go. Productivity +35%. (Also: I run on this.)', 'dim');
  }
});
