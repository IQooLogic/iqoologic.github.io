/*
 * Extra files in the virtual filesystem, for flavour. CV files (about.txt, projects/, …)
 * are generated automatically from the other content files.
 *
 *   Portfolio.file(path, content, opts)   content: string, or cv => string
 *   Portfolio.dir(path, opts)             opts.locked: true → "Permission denied"
 * Paths starting with ~ are inside /home/guest. Parent directories are created for you.
 */

Portfolio.file('/etc/motd', cv => `Welcome to PortfolioOS 26.10 "Curious Cat"\n\n * Documentation: help\n * Support:       contact\n * Résumé (GUI):  gui\n\n0 updates can be applied immediately. Everything is up to date. Like ${cv.name}.`);
Portfolio.file('/etc/hostname', cv => `${cv.handle}-portfolio`);
Portfolio.file('/etc/os-release', cv => `NAME="PortfolioOS"\nVERSION="26.10 (Curious Cat)"\nID=portfolioos\nID_LIKE=linux\nPRETTY_NAME="PortfolioOS 26.10"\n${cv.contact.website ? `HOME_URL="${cv.contact.website}"\n` : ''}SUPPORT_URL="mailto:${cv.contact.email}"`);
Portfolio.file('/etc/passwd', cv => `root:x:0:0:root:/root:/bin/msh\n${cv.handle}:x:1000:1000:${cv.fullName}:/home/${cv.handle}:/bin/msh\nguest:x:1001:1001:Curious Visitor:/home/guest:/bin/msh\nrecruiter:x:1337:1337:Welcome!:/home/guest:/bin/hire`);
Portfolio.file('/etc/shadow', '', { locked: true });

Portfolio.dir('/root', { locked: true });
Portfolio.dir(`/home/${Portfolio.cv.handle}`, { locked: true }); // your own home dir: off limits to guests

Portfolio.file('~/publications.txt', '“Smart TV Application based on Web 2.0”\nYU Info Conference, 2012\nStojković, Stošović');

Portfolio.file('/dev/null', '');
Portfolio.file('/dev/random', '4 // chosen by fair dice roll. guaranteed to be random. (xkcd 221)');

Portfolio.file('/var/log/coffee.log', [
  '[07:58:02] coffeed: boot sequence started',
  '[07:58:03] coffeed: grinding beans (18g, medium-fine)',
  '[07:58:40] coffeed: brew complete. productivity +35%',
  '[10:30:11] coffeed: WARN caffeine levels dropping',
  '[10:31:00] coffeed: second cup dispatched',
  '[14:02:17] coffeed: ERROR afternoon slump detected, retrying...',
  '[14:05:00] coffeed: third cup. stable.'
].join('\n'));
Portfolio.file('/var/log/auth.log', 'Oct  2 09:13:37 portfolio sshd[1337]: Accepted curiosity for guest from 127.0.0.1\nOct  2 09:14:02 portfolio sudo: guest : user NOT in sudoers ; COMMAND=/bin/everything');

Portfolio.file('~/.bash_history', [
  'git commit -m "fix"', 'git commit -m "fix for real"', 'git commit -m "ok this time for real"',
  'git push --force  # sorry', 'vim main.go', ':q', ':q!', ':wq!!!', 'how to exit vim',
  'sudo !!', 'go test -race ./...', 'golangci-lint run', 'docker system prune -a  # oops',
  'cat ~/.secret/README', "history -c  # cover tracks (doesn't work here)"
].join('\n'));
