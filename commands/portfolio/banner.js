/* banner — reprints the welcome screen. */
Portfolio.command({
  name: 'banner',
  group: 'Portfolio',
  desc: 'show the welcome banner',
  aliases: ['welcome'],
  run(args, t) { Portfolio.boot.welcome(t); }
});
