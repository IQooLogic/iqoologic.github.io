/* yes — prints forever, a good way to try Ctrl+C. */
Portfolio.command({
  name: 'yes',
  hidden: true,
  desc: 'y forever (Ctrl+C to stop)',
  async run(args, t) {
    const word = args.join(' ') || 'y';
    for (let i = 0; i < 2000; i++) { t.printText(word); await t.sleep(25); }
  }
});
