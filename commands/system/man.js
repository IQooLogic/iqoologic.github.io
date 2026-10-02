/* man — a manual page built from each command's name, desc and usage. */
Portfolio.command({
  name: 'man',
  group: 'System',
  desc: 'manual for a command',
  complete: () => Portfolio.term.visibleCommands().map(c => c.name),
  run(args, t) {
    const { esc } = t;
    if (!args[0]) { t.printText('What manual page do you want?\nFor example, try `man ls`.'); return 1; }
    const c = t.commands.get(args[0]) || t.commands.get(t.aliases[args[0]]);
    if (!c) { t.printText(`No manual entry for ${args[0]}`, 'err'); return 1; }
    if (c.name === 'man') { t.printText('man(1): an interface to the system reference manuals. Yes, you just read the manual for the manual.'); return; }
    const aka = (c.aliases || []).length ? `\n\n<span class="h">ALIASES</span>\n       ${esc(c.aliases.join(', '))}` : '';
    t.print(`<span class="h">${esc(c.name.toUpperCase())}(1)</span>                 <span class="dim">msh manual</span>\n\n<span class="h">NAME</span>\n       ${esc(c.name)} — ${esc(c.desc || 'undocumented. it is a secret, after all.')}\n\n<span class="h">SYNOPSIS</span>\n       ${esc(c.usage)}${c.filter ? ' [args]   (also reads from a pipe)' : ' [args]'}${aka}\n\n<span class="h">BUGS</span>\n       None known. Found one? ${t.cmd('contact')}`);
  }
});
