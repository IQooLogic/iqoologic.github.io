/* Tiny one-liners. Add your own here. */
Portfolio.command({ name: 'xyzzy', hidden: true, desc: 'magic', run(args, t) { t.printText('Nothing happens.'); } });
Portfolio.command({ name: '42', hidden: true, desc: 'the answer', run(args, t) { t.printText('The answer to life, the universe, and everything. But what is the question?'); } });
Portfolio.command({
  name: 'hello',
  hidden: true,
  desc: 'say hi',
  aliases: ['hi'],
  run(args, t) { t.print(`Hello, friend! 👋 Start with ${t.cmd('about')} or ${t.cmd('help')}.`); }
});
