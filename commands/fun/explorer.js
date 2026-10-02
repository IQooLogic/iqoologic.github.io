/* Explorer achievement: listening or moving outside the home directory. Shows how to hook shell events. */
Portfolio.achievement({ id: 'explorer', title: 'Explorer', desc: 'Wandered outside the home directory', hint: 'The filesystem is bigger than ~. Try `cd /`.' });

Portfolio.onStart(t => {
  const outside = path => !path.startsWith(Portfolio.VFS.HOME);
  t.on('cd', path => { if (outside(path)) t.unlock('explorer'); });
  t.on('ls', ({ path }) => { if (outside(path)) t.unlock('explorer'); });
});
