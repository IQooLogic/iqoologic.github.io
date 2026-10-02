/* vim (and vi, nvim, nano, emacs) — a fake editor whose only feature is being exited. */
(function () {
  const { esc } = Portfolio.util;
  Portfolio.achievement({ id: 'vim', title: 'Escape Artist', desc: 'Successfully exited vim', hint: 'Open the editor everyone fears. Then leave.' });

  Portfolio.style(`
    .vim { position: absolute; inset: 0; z-index: 5; background: var(--bg); display: flex; flex-direction: column; font-size: var(--fs); padding: 8px 12px; }
    .vim-lines { flex: 1; overflow: hidden; }
    .vim-lines div { white-space: pre; height: 1.45em; display: flex; }
    .vim-tilde { color: var(--accent); width: 2ch; flex: none; }
    .vim-center { flex: 1; text-align: center; color: var(--fg); }
    .vim-status { display: flex; justify-content: space-between; border-top: 1px solid var(--dim); padding-top: 4px; min-height: 1.6em; }
    .vim-pos { color: var(--dim); }
  `);

  const SPLASH = [
    '', '', 'VIM - Vi IMproved', '', 'version 9.1 (portfolio edition)', 'by Bram Moolenaar et al.',
    '', 'It is not a trap. Probably.', '',
    'type  :q<Enter>              to exit',
    'type  :help hire<Enter>      for something useful',
    'type  :wq<Enter>             to pretend you saved'
  ];
  const QUIT = ['q', 'q!', 'wq', 'wq!', 'x', 'qa', 'qa!', 'quit', 'exit'];

  function edit(t, file) {
    return new Promise(resolve => {
      const host = t.fx.host();
      const box = document.createElement('div');
      box.className = 'vim';
      const rows = Math.max(10, Math.floor(host.clientHeight / 22) - 2);
      const lines = Array.from({ length: rows }, (_, i) =>
        `<div><span class="vim-tilde">~</span><span class="vim-center">${esc(file ? '' : (SPLASH[i - 1] ?? ''))}</span></div>`);
      box.innerHTML = `<div class="vim-lines">${lines.join('')}</div><div class="vim-status"><span class="vim-cmd"></span><span class="vim-pos">0,0-1 All</span></div>`;
      host.appendChild(box);
      const status = box.querySelector('.vim-cmd');
      if (file) status.textContent = `"${file}" [readonly] — you can look, but you can't touch`;
      let buffer = null; // null = normal mode, string = typing a : command
      const exit = () => { box.remove(); t.unlock('vim'); resolve(); };

      t.program = {
        onKey: e => {
          e.preventDefault();
          if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { status.textContent = 'Type  :qa!  and press <Enter> to abandon all changes and exit Vim'; buffer = null; return; }
          if (buffer === null) {
            if (e.key === ':') { buffer = ''; status.textContent = ':'; }
            else if (e.key === 'i') status.textContent = '-- INSERT -- (just kidding, this file is read-only. Try :q)';
            else if (e.key === 'Escape') status.textContent = '';
            else if (e.key.length === 1) status.textContent = 'Hint: press  :  then  q  then  Enter';
            return;
          }
          if (e.key === 'Escape') { buffer = null; status.textContent = ''; }
          else if (e.key === 'Backspace') {
            if (!buffer) { buffer = null; status.textContent = ''; }
            else { buffer = buffer.slice(0, -1); status.textContent = ':' + buffer; }
          } else if (e.key === 'Enter') {
            const c = buffer.trim();
            buffer = null;
            if (QUIT.includes(c)) exit();
            else if (c.startsWith('help')) status.textContent = 'Recruiting? Exit with :q and run `hire`. Seriously, it is the best command here.';
            else if (c === 'w') status.textContent = "E45: 'readonly' option is set (add ! to override... it will not help)";
            else status.textContent = `E492: Not an editor command: ${c}`;
          } else if (e.key.length === 1) { buffer += e.key; status.textContent = ':' + buffer; }
        }
      };
    });
  }

  for (const name of ['vim', 'vi', 'nvim', 'nano', 'emacs']) {
    Portfolio.command({
      name,
      hidden: true,
      desc: 'the editor',
      async run(args, t) {
        if (name === 'emacs') { t.printText('emacs: a great operating system, lacking only a decent editor. Launching vim instead…', 'dim'); await t.sleep(900); }
        if (name === 'nano') { t.printText('nano: real security engineers use… fine, here is vim anyway.', 'dim'); await t.sleep(900); }
        await edit(t, args[0] || '');
        t.print('<span class="ok">You exited vim.</span> <span class="dim">Put that on your CV. I did.</span>');
      }
    });
  }
})();
