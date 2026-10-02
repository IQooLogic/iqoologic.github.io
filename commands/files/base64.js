/* base64 — encode, or decode with -d. Emits t.emit('decoded', text) after a successful decode. */
(function () {
  function convert(input, args) {
    if (!args.includes('-d') && !args.includes('--decode')) return { ok: true, text: btoa(unescape(encodeURIComponent(input))) };
    try {
      return { ok: true, decoded: true, text: decodeURIComponent(escape(atob(input.trim()))) };
    } catch (err) {
      console.warn('base64: decode failed', err);
      return { ok: false, text: 'base64: invalid input' };
    }
  }

  Portfolio.command({
    name: 'base64',
    group: 'Files',
    desc: 'encode / decode (-d) base64',
    filter(input, args) {
      const r = convert(input, args);
      if (r.decoded) Portfolio.term.emit('decoded', r.text);
      return r.text;
    },
    run(args, t) {
      const files = args.filter(a => !a.startsWith('-'));
      const input = t.readFile(files[files.length - 1], 'base64');
      if (input === null) return 1;
      const r = convert(input, args);
      t.printText(r.text, r.ok ? '' : 'err');
      if (r.decoded) t.emit('decoded', r.text);
      return r.ok ? 0 : 1;
    }
  });
})();
