/* crt — scanlines and glow. The default is `crt` in site.config.js; the visitor's choice is remembered. */
Portfolio.command({
  name: 'crt',
  group: 'System',
  desc: 'toggle CRT scanlines & glow',
  complete: ['on', 'off'],
  run(args, t) {
    const win = document.getElementById('window');
    const on = args[0] ? args[0] === 'on' : !win.classList.contains('crt');
    win.classList.toggle('crt', on);
    t.store.set('crt', on);
    t.printText(`crt effect ${on ? 'on' : 'off'}`, 'dim');
  }
});
