/* clear — also bound to Ctrl+L. */
Portfolio.command({
  name: 'clear',
  group: 'System',
  desc: 'clear the screen (Ctrl+L)',
  aliases: ['cls'],
  run(args, t) { t.clear(); }
});
