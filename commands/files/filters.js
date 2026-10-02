/*
 * Text filters that work on files and in pipes: grep, head, tail, wc, sort, uniq, rev, tac.
 * A command with a `filter(input, args)` function can be used after a |.
 * Return a string, or { text, html } when the final output should be coloured.
 */
(function () {
  const { esc } = Portfolio.util;
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (args, fallback) => parseInt((args.find(a => /^-?\d+$/.test(a)) || `-${fallback}`).replace('-', ''), 10);

  const FILTERS = {
    grep: {
      desc: 'search text (works with pipes)',
      fn(input, args) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const pattern = args.find(a => !a.startsWith('-'));
        if (!pattern) return 'usage: grep [-i] [-v] PATTERN';
        const re = new RegExp(escapeRe(pattern), flags.includes('i') ? 'gi' : 'g');
        const lines = input.split('\n').filter(l => { re.lastIndex = 0; return re.test(l) !== flags.includes('v'); });
        const mark = new RegExp(escapeRe(esc(pattern)), re.flags);
        return { text: lines.join('\n'), html: `<span class="pre">${lines.map(l => esc(l).replace(mark, m => `<mark>${m}</mark>`)).join('\n')}</span>` };
      }
    },
    head: { desc: 'first lines (-N)', fn: (input, args) => input.split('\n').slice(0, count(args, 10)).join('\n') },
    tail: { desc: 'last lines (-N)', fn: (input, args) => input.split('\n').slice(-count(args, 10)).join('\n') },
    wc: {
      desc: 'count lines, words, chars',
      fn(input, args) {
        const l = input.split('\n').length, w = input.split(/\s+/).filter(Boolean).length, c = input.length;
        if (args.includes('-l')) return String(l);
        if (args.includes('-w')) return String(w);
        return `${String(l).padStart(7)} ${String(w).padStart(7)} ${String(c).padStart(7)}`;
      }
    },
    sort: { desc: 'sort lines (-r)', fn: (input, args) => { const s = input.split('\n').sort(); return (args.includes('-r') ? s.reverse() : s).join('\n'); } },
    uniq: { desc: 'drop repeated lines', fn: input => input.split('\n').filter((l, i, a) => l !== a[i - 1]).join('\n') },
    rev: { desc: 'reverse each line', fn: input => input.split('\n').map(l => [...l].reverse().join('')).join('\n') },
    tac: { desc: 'reverse line order', fn: input => input.split('\n').reverse().join('\n') }
  };

  for (const [name, f] of Object.entries(FILTERS)) {
    Portfolio.command({
      name,
      group: 'Files',
      desc: f.desc,
      hidden: name !== 'grep',
      filter: (input, args) => f.fn(input, args),
      run(args, t) {
        const operands = args.filter(a => !a.startsWith('-'));
        if (name === 'grep' && !operands.length) { t.printText('usage: grep [-i] [-v] PATTERN [FILE]', 'err'); return 1; }
        const files = name === 'grep' ? operands.slice(1) : operands;
        const input = t.readFile(files[files.length - 1], name);
        if (input === null) return 1;
        const out = f.fn(input, args);
        if (typeof out === 'object') t.print(out.html); else t.printText(out);
      }
    });
  }
})();
