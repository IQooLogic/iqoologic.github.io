/* git — your career as a commit history (built from experience and education). */
(function () {
  Portfolio.achievement({ id: 'historian', title: 'Historian', desc: 'Read the career git log', hint: 'Careers have version control too. `git log`.' });

  function hash7(s) {
    let h = 2166136261;
    for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
  }

  function log(t, oneline) {
    const { cv, esc } = t;
    const commits = [
      ...cv.experience.map(e => ({ date: e.from, msg: `feat(career): join ${e.company} as ${e.role}`, body: e.bullets })),
      ...cv.education.map(e => ({ date: e.to + '-07', msg: `feat(edu): graduate — ${e.degree}`, body: [e.school] })),
      { date: `${cv.startedCoding}-01`, msg: 'chore: initial commit — print("hello, world")', body: ['It compiled on the first try. Never again.'] }
    ];
    return commits.map((c, i) => {
      const h = hash7(c.msg);
      const refs = i === 0 ? ' <span class="accent2">(</span><span class="cyan">HEAD -&gt; </span><span class="ok">main</span><span class="accent2">, </span><span class="err">origin/main</span><span class="accent2">)</span>' : '';
      if (oneline) return `<span class="warn">${h}</span>${refs} ${esc(c.msg)}`;
      const d = new Date(c.date + '-01T10:00:00');
      return `<span class="warn">commit ${h}${hash7(c.date)}${hash7(h)}${hash7(c.msg + 'x').slice(0, 5)}</span>${refs}\nAuthor: ${esc(cv.fullName)} &lt;${esc(cv.contact.email)}&gt;\nDate:   ${d.toDateString()}\n\n    ${esc(c.msg)}\n${c.body.map(b => '\n    ' + esc(b)).join('')}\n`;
    }).join('\n');
  }

  Portfolio.command({
    name: 'git',
    hidden: true,
    desc: 'career version control',
    run(args, t) {
      const sub = args[0];
      if (sub === 'log') { t.unlock('historian'); t.print(log(t, args.includes('--oneline'))); return; }
      if (sub === 'status') { t.print("On branch <span class=\"ok\">main</span>\nYour branch is ahead of 'origin/expectations' by 9001 commits.\n\nnothing to commit, working tree clean — open to new opportunities though"); return; }
      if (sub === 'blame') { t.printText(`${hash7('blame')} (${t.cv.fullName} ${new Date().toISOString().slice(0, 10)}) it was me. it's always me.`); return; }
      if (sub === 'push' && args.some(a => a.startsWith('--force') || a === '-f')) { t.printText('remote: rejected. force-pushing to main is a fireable offence. ask me how I know.', 'err'); return 1; }
      if (sub === 'clone') { t.print(`Cloning into '${t.esc(args[1] || t.cv.handle)}'… fatal: humans cannot be cloned (yet). The next best thing: ${t.cmd('contact')}`); return 128; }
      if (!sub) { t.print(`usage: git &lt;command&gt;\n\n   ${t.cmd('git log')}       career history\n   ${t.cmd('git status')}    current status\n   ${t.cmd('git blame')}     who did this?`); return 1; }
      t.printText(`git: '${sub}' is not a git command. See 'git --help'.`, 'err');
      return 1;
    }
  });
})();
