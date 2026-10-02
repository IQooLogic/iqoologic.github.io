/* neofetch — system info, portfolio flavoured. */
(function () {
  const LOGO = String.raw`
        .--.
       |o_o |
       |:_/ |
      //   \ \
     (|     | )
    /'\_   _/'\
    \___)=(___/`;

  function browserName() {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Microsoft Edge';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Chrome\//.test(ua)) return 'Chromium-based browser';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Mystery Browser';
  }

  Portfolio.command({
    name: 'neofetch',
    group: 'Portfolio',
    desc: 'system info, portfolio flavoured',
    run(args, t) {
      const { cv, esc } = t;
      const skillCount = cv.skills.reduce((n, g) => n + g.items.length, 0);
      const mem = navigator.deviceMemory || 8;
      const rows = [
        ['OS', 'PortfolioOS 26.10 "Curious Cat" x86_64'],
        ['Host', cv.fullName],
        ['Role', cv.title],
        ['Kernel', '6.9.0-coffee'],
        ['Uptime', `${Portfolio.util.yearsCoding()} years (since ${cv.startedCoding})`],
        ['Packages', `${skillCount} skills, ${cv.projects.length} projects`],
        ['Shell', 'msh 2.0'],
        ['Resolution', `${screen.width}x${screen.height}`],
        ['Theme', document.documentElement.dataset.theme],
        ['Terminal', browserName()],
        ['CPU', 'Brain v1 @ 3.6 GHz (caffeinated)'],
        ['Memory', `${mem * 512}MiB / ${mem * 1024}MiB`],
        ['Location', cv.location],
        ['Languages', cv.languages.map(l => l[0]).join(', ')]
      ];
      const swatches = ['--err', '--ok', '--warn', '--accent', '--accent2', '--cyan', '--fg', '--dim']
        .map(v => `<span class="swatch" style="background:var(${v})"></span>`).join('');
      t.print(`<div class="neofetch"><pre class="logo">${esc(LOGO)}</pre><div>
        <div><span class="accent">guest</span>@<span class="accent">${esc(cv.handle)}-portfolio</span></div>
        <div class="dim">${'─'.repeat(26)}</div>
        ${rows.map(([k, v]) => `<div><span class="accent">${k}</span>: ${esc(v)}</div>`).join('')}
        <div class="swatches">${swatches}</div>
      </div></div>`);
    }
  });
})();
