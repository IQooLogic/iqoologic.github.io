/* Konami code (↑ ↑ ↓ ↓ ← → ← → B A) and the `party` command. */
(function () {
  Portfolio.achievement({ id: 'konami', title: 'Old School', desc: 'Entered the Konami code', hint: '↑ ↑ ↓ ↓ ← → ← → B A' });

  const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    pos = k === CODE[pos] ? pos + 1 : (k === CODE[0] ? 1 : 0);
    if (pos === CODE.length) { pos = 0; Portfolio.fx.party(); Portfolio.achievements.unlock('konami'); }
  }, true);

  Portfolio.command({
    name: 'party',
    hidden: true,
    desc: 'party mode',
    run(args, t) { t.fx.party(); t.printText('🎉 party mode (6 seconds of joy)'); }
  });
})();
