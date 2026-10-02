/* sudo, make — nobody gets root. Except for sandwiches (xkcd 149). */
Portfolio.achievement({ id: 'sudo', title: 'Nice Try', desc: 'Attempted to become root', hint: 'With great power comes… `sudo`.' });
Portfolio.achievement({ id: 'sandwich', title: 'xkcd 149', desc: 'Asked politely for a sandwich', hint: 'Make me a sandwich. No? What if you insist?' });

Portfolio.command({
  name: 'sudo',
  hidden: true,
  desc: 'superuser do',
  async run(args, t) {
    t.unlock('sudo');
    const cmd = args.join(' ');
    if (cmd === 'make me a sandwich') { t.unlock('sandwich'); t.printText('Okay. 🥪'); return; }
    if (/^hire|^\.\/hire-me\.sh/.test(cmd) && t.isCommand('hire')) { t.printText('[sudo] permission granted. You clearly know what you are doing.', 'ok'); return t.run(['hire']); }
    if (/^rm\s/.test(cmd)) return t.run(cmd.split(/\s+/));
    if (!cmd) { t.printText('usage: sudo command', 'err'); return 1; }
    for (let attempt = 1; attempt <= 3; attempt++) {
      await t.readLine('[sudo] password for guest: ', { mask: true });
      await t.sleep(500);
      if (attempt < 3) t.printText('Sorry, try again.', 'err');
    }
    t.printText('sudo: 3 incorrect password attempts', 'err');
    t.printText('guest is not in the sudoers file. This incident will be reported.', 'err');
    await t.sleep(400);
    await t.progress('📨 reporting incident to santa', 900, 16);
    t.print(`<span class="dim">(you are now on the naughty list.${t.isCommand('hire') ? ` psst — </span>${t.cmd('sudo hire')}<span class="dim"> works.` : ''})</span>`);
    return 1;
  }
});

Portfolio.command({
  name: 'make',
  hidden: true,
  desc: 'build things',
  run(args, t) {
    if (args.join(' ') === 'me a sandwich') { t.printText('What? Make it yourself.', 'err'); return 1; }
    if (args[0] === 'coffee' && t.isCommand('coffee')) return t.run(['coffee']);
    t.printText(`make: *** No rule to make target '${args[0] || 'all'}'.  Stop.`, 'err');
    return 2;
  }
});
