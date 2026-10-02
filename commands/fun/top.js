/* top — a process list of personality traits. Edit PROCESSES to make it yours. */
(function () {
  const PROCESSES = [
    ['1', 'systemd', '0.1', cv => `init (since ${cv.startedCoding})`],
    ['42', 'curiosity', '38.0', 'never sleeps'],
    ['137', 'go-build', '24.5', 'compiling side projects'],
    ['443', 'tls-handshake', '9.8', 'fingerprinting your browser (kidding)'],
    ['666', 'imposter-syndrome', '0.0', 'suspended (SIGSTOP)'],
    ['1337', 'ctf-solver', '12.2', 'weekends only'],
    ['2048', 'coffeed', '15.4', 'critical, do not kill'],
    ['8080', 'learning', '∞', 'always running']
  ];

  Portfolio.command({
    name: 'top',
    hidden: true,
    desc: 'process list',
    aliases: ['htop', 'btop'],
    run(args, t) {
      const rows = PROCESSES.map(([pid, cmd, cpu, note]) => {
        const text = typeof note === 'function' ? note(t.cv) : note;
        return `${pid.padEnd(7)}<span class="accent">${t.esc(cmd.padEnd(20))}</span>${cpu.padEnd(7)}<span class="dim">${t.esc(text)}</span>`;
      });
      t.print(`<span class="dim">top - ${new Date().toTimeString().slice(0, 8)} up ${Portfolio.util.yearsCoding()} years · Tasks: ${PROCESSES.length} · load: high (curiosity)</span>\n<span class="h">${'PID'.padEnd(7)}${'COMMAND'.padEnd(20)}${'%CPU'.padEnd(7)}NOTE</span>\n${rows.join('\n')}`);
    }
  });
})();
