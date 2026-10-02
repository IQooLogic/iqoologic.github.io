/* nmap — your skills as open ports. */
(function () {
  const PORTS = [22, 53, 80, 443, 1337, 2375, 3000, 4222, 5432, 6379, 8080, 8443, 9090, 9092, 9200, 11211, 27017, 31337, 50051, 6443, 8000];
  const levelLabel = n => n >= 90 ? 'expert' : n >= 75 ? 'advanced' : n >= 60 ? 'proficient' : 'learning';

  Portfolio.command({
    name: 'nmap',
    hidden: true,
    desc: 'scan for open ports (= skills)',
    async run(args, t) {
      const target = args.find(a => !a.startsWith('-')) || 'localhost';
      const skills = t.cv.skills.flatMap(g => g.items);
      t.printText(`Starting Nmap 7.95 ( https://nmap.org ) at ${new Date().toISOString().slice(0, 16).replace('T', ' ')} CEST`);
      await t.sleep(600);
      t.printText(`Nmap scan report for ${target} (127.0.0.1)\nHost is up (0.00042s latency).\nNot shown: ${65535 - skills.length} closed tcp ports (reset)`);
      t.print('<span class="h">PORT       STATE  SERVICE                 VERSION</span>');
      for (let i = 0; i < skills.length; i++) {
        const [name, lvl] = skills[i];
        const port = `${PORTS[i % PORTS.length] + Math.floor(i / PORTS.length)}/tcp`;
        t.print(`${port.padEnd(10)} <span class="ok">open</span>   ${t.esc(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').padEnd(23))} <span class="dim">${levelLabel(lvl)} (${lvl}%)</span>`);
        await t.sleep(40);
      }
      t.printText(`\nService detection performed. 1 IP address (1 host up) scanned in ${(skills.length * 0.04 + 0.6).toFixed(2)} seconds`);
      t.print('<span class="dim">OS details: Human, caffeinated, actively learning. No vulnerabilities found. 😉</span>');
    }
  });
})();
