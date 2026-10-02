/* help — lists every visible command, grouped. Hidden commands are counted, not shown. */
Portfolio.command({
  name: 'help',
  group: 'Portfolio',
  desc: 'list available commands',
  run(args, t) {
    const order = ['Portfolio', 'Files', 'System', 'Fun'];
    const all = t.visibleCommands();
    const groups = [...new Set([...order, ...all.map(c => c.group)])];
    t.blank();
    for (const g of groups) {
      const cmds = all.filter(c => c.group === g);
      if (!cmds.length) continue;
      t.print(`<span class="h">${t.esc(g)}</span>`);
      t.print(`<div class="help-grid">${cmds.map(c => `<span>${t.cmd(c.name)}</span><span class="dim">${t.esc(c.desc)}</span>`).join('')}</div>`);
    }
    const hidden = [...t.commands.values()].filter(c => c.hidden).length;
    const total = Portfolio.registry.achievements.length;
    if (hidden) t.print(`<span class="dim">…and <b class="accent2">${hidden}</b> hidden commands. Explore.${total ? ` Achievements: ${Portfolio.achievements.count()}/${total}` : ''}${t.isCommand('hint') ? ` — stuck? try ${t.cmd('hint')}.` : ''}</span>`);
    t.print(`<span class="dim">Keys: Tab complete · ↑↓ history · → accept suggestion · Ctrl+C cancel · Ctrl+L clear${t.isCommand('cowsay') ? ' · pipes work: </span>' + t.cmd('fortune | cowsay') : '</span>'}`);
  }
});
