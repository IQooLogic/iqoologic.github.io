/* ping — four fake replies (Ctrl+C stops it early). */
Portfolio.command({
  name: 'ping',
  hidden: true,
  desc: 'ping a host',
  async run(args, t) {
    const host = args[0] || t.cv.handle;
    t.printText(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
    let n = 0;
    try {
      for (n = 1; n <= 4; n++) {
        await t.sleep(700);
        t.printText(`64 bytes from ${host}: icmp_seq=${n} ttl=64 time=${(Math.random() * 0.4 + 0.05).toFixed(3)} ms${host === t.cv.handle ? '  (always responsive)' : ''}`);
      }
    } finally {
      t.printText(`\n--- ${host} ping statistics ---\n${n - 1} packets transmitted, ${n - 1} received, 0% packet loss`);
    }
  }
});
