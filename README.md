# Terminal Portfolio

An interactive CV that looks and behaves like a Linux terminal: a boot sequence, a real-feeling shell
(tab completion, history, pipes, `&&`), a virtual filesystem, a printable GUI résumé, themes,
and a pile of easter eggs with achievements.

No build step, no dependencies, no framework. Open `index.html` in a browser and it runs —
double-clicking the file works, and so does any static host (GitHub Pages, Netlify, S3…).

## Make it yours

You only edit **content**, **config**, **themes** and **commands**. You never need to touch `core/` or `css/`.

| To change…                              | Edit                                   |
|-----------------------------------------|----------------------------------------|
| Name, title, tagline, about, contacts   | `content/profile.js`                   |
| Skills / jobs / projects / education    | `content/skills.js`, `experience.js`, `projects.js`, `education.js` |
| `fortune` quotes                        | `content/fortunes.js`                  |
| Extra files in the fake filesystem      | `content/files.js`                     |
| GUI résumé sections and their order     | `gui` in `site.config.js`, custom sections in `content/sections.js` |
| Default theme, boot style, welcome text, phone buttons, aliases | `site.config.js` |
| Which commands / easter eggs exist      | `commands` list in `site.config.js`    |

The welcome banner is drawn from `banner` in `content/profile.js` (A–Z, 0–9 and `- _ . ! ?`).
Set `bannerArt` instead if you want hand-made ASCII art.

A project `link` and the `contact` entries other than `email` are optional — leave out what you do not have.

## Project layout

```
index.html          loads core/portfolio.js and site.config.js — nothing else
site.config.js      settings + the list of every module to load, in order
content/            your CV data (one file per section)
themes/             one file per colour theme
commands/           one file per command or feature
  portfolio/        about, skills, projects, gui…
  files/            ls, cd, cat, grep…
  system/           theme, history, man, exit…
  fun/              easter eggs; each one owns its achievement, files and CSS
core/               the engine (shell, filesystem, boot, GUI résumé) — no need to edit
css/                the look — no need to edit
```

Modules are plain scripts that register themselves on the global `Portfolio` object.
A module that is listed in `site.config.js` but missing, or one that throws an error,
is reported in red in the terminal; the rest of the site keeps working.

## Recipes

### Add a command

Create `commands/fun/hello-world.js`:

```js
Portfolio.command({
  name: 'greet',             // what the visitor types
  group: 'Fun',              // help section: Portfolio, Files, System, Fun (or a new one)
  desc: 'say hello',         // shown in `help` and `man greet`
  aliases: ['hey'],          // optional
  hidden: false,             // true = works, but is not listed in `help`
  complete: ['world', 'you'],// optional Tab completions for arguments (array or () => array)
  async run(args, t) {
    t.printText(`Hello, ${args[0] || 'world'}!`);
    t.print(`Next: ${t.cmd('about')}`);   // clickable command link
    return 0;                             // exit status (optional)
  }
});
```

Then add `'fun/hello-world'` to `commands` in `site.config.js`. That's it.

To make it work after a pipe (`fortune | greet`), add `filter: (input, args) => 'text'`.

### Add an achievement

Put it in the same file as the thing that unlocks it:

```js
Portfolio.achievement({ id: 'greeter', title: 'Friendly', desc: 'Said hello', hint: 'Try `greet`.' });
// …inside run():  t.unlock('greeter');
```

`achievements` and `hint` pick it up automatically. Remove the module and the achievement goes with it.

### React to what the visitor does

```js
Portfolio.onStart(t => {
  t.on('cd', path => { /* … */ });
  t.on('ls', ({ path, all }) => { /* … */ });
  t.on('cat', path => { /* … */ });
  t.on('run', (name, args) => { /* any command */ });
  t.on('notfound', name => { /* typo */ });
});
```

`commands/fun/explorer.js` and `commands/fun/ctf.js` are short, complete examples.

### Add a file or directory

```js
Portfolio.file('~/notes/todo.txt', 'buy coffee');                    // ~ is /home/guest
Portfolio.file('/etc/motd', cv => `Hello from ${cv.name}`);          // computed from your content
Portfolio.file('~/run-me.sh', '#!/bin/msh\ngreet', { exec: 'greet' }); // ./run-me.sh runs `greet`
Portfolio.dir('/vault', { locked: true });                            // "Permission denied"
```

### Add a theme

Create `themes/sunset.js` and add `'sunset'` to `themes` in `site.config.js`:

```js
Portfolio.theme('sunset', {
  bg: '#1a1020', bg2: '#22142a', bar: '#2a1832', fg: '#ffe8d6', dim: '#a88a9a',
  accent: '#ff8c42', accent2: '#ff3c78', ok: '#9be564', warn: '#ffd23f', err: '#ff4f4f', cyan: '#5ce1e6',
  sel: 'rgba(255,140,66,.3)', glow: 'rgba(255,140,66,.4)',
  wall1: '#5c1d47', wall2: '#ff8c42', wall3: '#120a14',   // page background gradient
  guiAccent: '#c2410c'                                     // optional: accent on the white GUI résumé
});
```

A missing key is reported on load. `theme sunset` switches to it; set `theme: 'sunset'` in the config to make it the default.

### Add or replace a GUI résumé section

In `content/sections.js`:

```js
Portfolio.guiSection('talks', {
  title: 'Talks',
  render: (cv, h) => h.list(['Fingerprinting TLS clients — BSides 2025'])
});
```

Then add `'talks'` to `gui.main` or `gui.side` in `site.config.js`. Built-in sections: `about`, `experience`,
`projects`, `skills`, `education`, `certifications`, `languages`, `interests`. Defining one of those names
replaces the built-in. `h.esc(text)`, `h.list([...])` and `h.tags([...])` help build the HTML.

### Remove an easter egg

Delete its line from `commands` in `site.config.js`. Its command, achievement and files disappear,
and achievement totals adjust.

### Module-owned CSS

A self-contained feature can ship its own styles: `Portfolio.style('.my-thing { … }')` — see `commands/fun/snake.js`.

## The `t` object (what commands get)

| Member | What it does |
|---|---|
| `t.print(html, cls)` / `t.printText(text, cls)` / `t.blank()` | write output (`cls`: `dim`, `ok`, `warn`, `err`, `accent`…) |
| `t.cmd(command, label)` / `t.link(url, label)` | clickable command / external link (HTML) |
| `await t.sleep(ms)` / `await t.type(text, cls, delay)` / `await t.progress(label, ms)` | animation helpers; Ctrl+C interrupts them |
| `await t.readLine(label, { mask })` | ask the visitor for input |
| `await t.run(['cmd', 'arg'])` | run another command |
| `t.readFile(path, cmdName)` | read a file, printing the standard error if it can't |
| `t.cv`, `t.config` | your content and site config |
| `t.esc(text)`, `t.meter(percent, width)` | escape HTML, draw a bar |
| `t.store.get/set(key)` | remember something in this visitor's browser |
| `t.fx.toast(html)`, `.confetti()`, `.party()`, `.host()` | effects; `host()` is the element full-screen programs draw on |
| `t.unlock(id)` | unlock an achievement |
| `t.program = { onKey(e) }` | take over the keyboard (games, editors) until your command returns |
| `t.vfs`, `t.cwd`, `t.env`, `t.history` | filesystem, current directory, `$VARS`, history |
| `t.on(event, fn)` / `t.emit(event, ...)` | shell events |

## URL options

- `?noboot` — skip the boot animation
- `?cmd=projects` — run a command once the prompt is ready (handy for deep links)

## Local preview

Double-click `index.html`, or serve the folder: `python3 -m http.server` → http://localhost:8000.
