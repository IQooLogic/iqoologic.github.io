/* whoami, date, uptime, uname — small system-info commands. */
Portfolio.command({
  name: 'whoami',
  group: 'System',
  desc: 'print current user',
  run(args, t) { t.printText('guest'); t.print(`<span class="dim">…but you probably meant </span>${t.cmd('about')}`); },
  filter: () => 'guest'
});

Portfolio.command({
  name: 'date',
  group: 'System',
  desc: 'current date and time',
  run(args, t) { t.printText(new Date().toString()); },
  filter: () => new Date().toString()
});

Portfolio.command({
  name: 'uptime',
  group: 'System',
  desc: 'how long I have been coding',
  run(args, t) {
    const s = Math.floor(performance.now() / 1000);
    t.printText(` ${new Date().toTimeString().slice(0, 8)} up ${Portfolio.util.yearsCoding()} years, ${new Date().getMonth() * 30} days,  1 user,  load average: 0.42, 0.37, 0.31 (coffee-bound)`);
    t.printText(` (this session: ${Math.floor(s / 60)}m ${s % 60}s — thanks for staying)`, 'dim');
  }
});

Portfolio.command({
  name: 'uname',
  group: 'System',
  desc: 'system information',
  run(args, t) {
    t.printText(args.includes('-a') ? `PortfolioOS ${t.cv.handle}-portfolio 6.9.0-coffee #1 SMP PREEMPT_DYNAMIC Fri Oct 2 13:37:00 CEST 2026 x86_64 GNU/Msh` : 'PortfolioOS');
  }
});
