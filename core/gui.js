/*
 * The "GUI mode": a conventional, printable résumé for people who prefer not to type.
 *
 * Layout comes from `gui` in site.config.js:   { main: [...], side: [...], titles: {...}, footer }
 * Built-in sections: about, experience, projects, skills, education, certifications, languages, interests.
 * Add your own (or replace a built-in) from any content file:
 *   Portfolio.guiSection('awards', { title: 'Awards', render: (cv, h) => `<ul>…</ul>` });
 * `render` returns HTML; return '' to hide the section. `h` has helpers: esc, tags, list.
 */
(function () {
  'use strict';
  const { esc } = Portfolio.util;

  const strip = url => url.replace(/^(https?:\/\/(www\.)?|mailto:)/, '');
  const helpers = {
    esc,
    tags: items => `<div class="gui-tags">${(items || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>`,
    list: items => `<ul>${(items || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
  };

  const builtin = (name, title, render) => Portfolio.guiSection(name, { title, render, builtin: true });

  builtin('about', 'About', cv => (cv.about || []).map(p => `<p>${esc(p)}</p>`).join(''));

  builtin('experience', 'Experience', (cv, h) => (cv.experience || []).map(e => `
    <div class="gui-job">
      <div class="gui-job-head"><h3>${esc(e.role)} <span>· ${esc(e.company)}</span></h3><span class="gui-date">${esc(e.from)} – ${esc(e.to)}</span></div>
      <ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      ${h.tags(e.tech)}
    </div>`).join(''));

  builtin('projects', 'Projects', (cv, h) => !(cv.projects || []).length ? '' : `
    <div class="gui-projects">${cv.projects.map(p => `
      <${p.link ? `a class="gui-project" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"` : 'div class="gui-project"'}>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        ${h.tags(p.tech)}
      </${p.link ? 'a' : 'div'}>`).join('')}
    </div>`);

  builtin('skills', 'Skills', cv => (cv.skills || []).map(g => `
    <h3>${esc(g.group)}</h3>
    ${g.items.map(([n, lvl]) => `<div class="gui-skill"><span>${esc(n)}</span><span class="gui-meter"><span style="width:${lvl}%"></span></span></div>`).join('')}`).join(''));

  builtin('education', 'Education', cv => (cv.education || []).map(e =>
    `<p><strong>${esc(e.degree)}</strong><br>${esc(e.school)}<br><span class="gui-date">${esc(e.from)} – ${esc(e.to)}</span></p>`).join(''));

  builtin('certifications', 'Certifications', (cv, h) => (cv.certifications || []).length ? h.list(cv.certifications) : '');

  builtin('languages', 'Languages', (cv, h) => (cv.languages || []).length ? h.list(cv.languages.map(([l, lvl]) => `${l} — ${lvl}`)) : '');

  builtin('interests', 'Interests', (cv, h) => (cv.interests || []).length ? h.tags(cv.interests) : '');

  const DEFAULT_LAYOUT = {
    main: ['about', 'experience', 'projects'],
    side: ['skills', 'education', 'certifications', 'languages', 'interests']
  };

  function section(name, layout, cv) {
    const def = Portfolio.registry.guiSections.get(name);
    if (!def) {
      console.error(`gui: unknown section "${name}" in site.config.js — define it with Portfolio.guiSection()`);
      return `<section><h2>${esc(name)}</h2><p class="gui-error">Unknown section "${esc(name)}" — see the browser console.</p></section>`;
    }
    let body;
    try { body = def.render(cv, helpers); }
    catch (err) {
      console.error(`gui: section "${name}" failed to render`, err);
      body = `<p class="gui-error">This section failed to render: ${esc(err.message)}</p>`;
    }
    if (!body) return '';
    const title = (layout.titles || {})[name] ?? def.title ?? name;
    return `<section data-section="${esc(name)}"><h2>${esc(title)}</h2>${body}</section>`;
  }

  function render() {
    const cv = Portfolio.cv;
    const layout = { ...DEFAULT_LAYOUT, ...(Portfolio.config.gui || {}) };
    const achievements = Portfolio.registry.achievements.length;
    const footer = layout.footer ?? (achievements ? `Psst — the terminal version has ${achievements} hidden achievements.` : '');
    const links = Object.entries(cv.contact || {}).map(([k, v]) => {
      const href = k === 'email' ? `mailto:${v}` : v;
      const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(href)}"${ext}>${esc(strip(v))}</a>`;
    }).join('');
    const avatar = cv.avatar
      ? `<img class="gui-avatar" src="${esc(cv.avatar)}" alt="">`
      : `<div class="gui-avatar" aria-hidden="true">${esc((cv.name || '?')[0])}</div>`;

    return `
      <div class="gui-backdrop" data-close></div>
      <article class="gui-card" role="dialog" aria-modal="true" aria-label="Résumé of ${esc(cv.fullName)}">
        <div class="gui-toolbar">
          <span class="gui-path">~/resume — GUI mode</span>
          <span class="gui-actions">
            <button class="gui-btn" data-print>Print / Save PDF</button>
            <button class="gui-btn primary" data-close>Back to terminal <kbd>Esc</kbd></button>
          </span>
        </div>
        <header class="gui-header">
          ${avatar}
          <div>
            <h1>${esc(cv.fullName)}</h1>
            <p class="gui-role">${esc(cv.title)} · ${esc(cv.location)}</p>
            ${cv.tagline ? `<p class="gui-tagline">${esc(cv.tagline)}</p>` : ''}
            <p class="gui-links">${links}</p>
          </div>
        </header>
        <div class="gui-grid${layout.side.length ? '' : ' single'}">
          <div class="gui-main">${layout.main.map(n => section(n, layout, cv)).join('')}</div>
          ${layout.side.length ? `<aside class="gui-side">${layout.side.map(n => section(n, layout, cv)).join('')}</aside>` : ''}
        </div>
        ${footer ? `<footer class="gui-footer">${esc(footer)}</footer>` : ''}
      </article>`;
  }

  let lastFocus = null;

  function open() {
    const el = document.getElementById('gui');
    el.innerHTML = render();
    el.hidden = false;
    lastFocus = document.activeElement;
    document.body.classList.add('gui-open');
    el.querySelector('[data-close].gui-btn').focus();
    document.dispatchEvent(new CustomEvent('portfolio:gui-open'));
  }

  function close() {
    const el = document.getElementById('gui');
    el.hidden = true;
    document.body.classList.remove('gui-open');
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#gui [data-close]')) close();
    if (e.target.closest('#gui [data-print]')) window.print();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('gui').hidden) close();
  });

  Portfolio.gui = { open, close };
})();
