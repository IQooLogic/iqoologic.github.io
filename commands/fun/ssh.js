/* ssh — you are already inside. */
Portfolio.command({
  name: 'ssh',
  hidden: true,
  desc: 'connect to a host',
  run(args, t) { t.printText(`ssh: connect to host ${args[0] || 'nowhere'} port 22: Connection refused — you are already inside. 🙂`, 'err'); return 255; }
});
