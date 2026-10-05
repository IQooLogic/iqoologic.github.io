/*
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIG — the one file that decides what is loaded.
 *
 *  Make it yours:  edit the files in content/   (your CV)
 *  Add a command:  create commands/<group>/<name>.js and list it below
 *  Add a theme:    create themes/<name>.js and list it below
 *  Remove a thing: delete its line below (and the file, if you like)
 *
 *  You never need to touch core/ or css/. See README.md for examples.
 * ─────────────────────────────────────────────────────────────
 */
Portfolio.configure({
  title: null,       // browser tab title; null means "<fullName> — Terminal Portfolio"
  description: 'Interactive terminal-style CV and portfolio. Type `help` to begin.',

  boot: 'auto',      // 'full' | 'quick' (no BIOS) | 'off' | 'auto' (full on first visit, quick after)
  theme: 'midnight', // default theme for first-time visitors
  crt: true,         // scanlines + glow on by default (`crt off` to toggle)

  welcome: {
    message: "Welcome to my interactive résumé. It's a (mostly) real shell — explore it like one.",
    commands: ['help', 'about', 'skills', 'experience', 'projects', 'contact', 'neofetch']
  },

  // Buttons along the bottom on phones
  quickCommands: ['help', 'about', 'skills', 'experience', 'projects', 'contact', 'gui'],

  // Shell aliases (also shown in ~/.mshrc)
  aliases: { ll: 'ls -la', la: 'ls -a', l: 'ls', h: 'help' },

  // The GUI résumé (`gui`). Section names: about, experience, projects, skills, education,
  // certifications, languages, interests — or your own, see content/sections.js.
  gui: {
    main: ['about', 'experience', 'projects'],
    side: ['now', 'skills', 'education', 'publications', 'languages', 'interests'],
    titles: {}, // e.g. { projects: 'Selected work' }
    footer: null // null = default hint about achievements, '' = no footer
  },

  /* ── modules, loaded in this order ─────────────────── */

  // content/<name>.js — your CV data
  content: ['profile', 'skills', 'experience', 'projects', 'education', 'fortunes', 'files', 'sections'],

  // themes/<name>.js — the first one is the fallback
  themes: ['midnight', 'dracula', 'matrix', 'amber', 'nord', 'ubuntu', 'paper'],

  // commands/<path>.js — one feature per file
  commands: [
    // portfolio
    'portfolio/help', 'portfolio/about', 'portfolio/skills', 'portfolio/experience', 'portfolio/projects',
    'portfolio/education', 'portfolio/contact', 'portfolio/gui', 'portfolio/neofetch', 'portfolio/banner',
    // files
    'files/ls', 'files/cd', 'files/cat', 'files/tree', 'files/open', 'files/filters', 'files/base64', 'files/rm',
    // system
    'system/clear', 'system/history', 'system/theme', 'system/crt', 'system/achievements',
    'system/info', 'system/shell', 'system/man', 'system/power',
    // fun & easter eggs — delete any line to remove that egg and its achievement
    'fun/fortune', 'fun/explorer', 'fun/ctf', 'fun/sudo', 'fun/vim', 'fun/matrix', 'fun/snake', 'fun/sl',
    'fun/hack', 'fun/nmap', 'fun/git', 'fun/hire', 'fun/konami', 'fun/coffee', 'fun/ping', 'fun/yes',
    'fun/top', 'fun/weather', 'fun/ssh', 'fun/misc'
  ]
});
