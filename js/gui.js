/* The "GUI mode": a conventional, printable résumé for people who prefer not to type. */
(function () {
  'use strict';
  const { esc } = window.MSH;
  const CV = window.CV;

  const strip = url => url.replace(/^https?:\/\/(www\.)?/, '');

  function render() {
    const c = CV.contact;
    return `
      <div class="gui-backdrop" data-close></div>
      <article class="gui-card" role="dialog" aria-modal="true" aria-label="Résumé of ${esc(CV.fullName)}">
        <div class="gui-toolbar">
          <span class="gui-path">~/resume — GUI mode</span>
          <span class="gui-actions">
            <button class="gui-btn" data-print>Print / Save PDF</button>
            <button class="gui-btn primary" data-close>Back to terminal <kbd>Esc</kbd></button>
          </span>
        </div>
        <header class="gui-header">
          <div class="gui-avatar" aria-hidden="true">${esc(CV.name[0])}</div>
          <div>
            <h1>${esc(CV.fullName)}</h1>
            <p class="gui-role">${esc(CV.title)} · ${esc(CV.location)}</p>
            <p class="gui-tagline">${esc(CV.tagline)}</p>
            <p class="gui-links">
              <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
              <a href="${esc(c.github)}" target="_blank" rel="noopener noreferrer">${esc(strip(c.github))}</a>
              <a href="${esc(c.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(strip(c.linkedin))}</a>
              <a href="${esc(c.website)}" target="_blank" rel="noopener noreferrer">${esc(strip(c.website))}</a>
            </p>
          </div>
        </header>
        <div class="gui-grid">
          <div class="gui-main">
            <section>
              <h2>About</h2>
              ${CV.about.map(p => `<p>${esc(p)}</p>`).join('')}
            </section>
            <section>
              <h2>Experience</h2>
              ${CV.experience.map(e => `
                <div class="gui-job">
                  <div class="gui-job-head"><h3>${esc(e.role)} <span>· ${esc(e.company)}</span></h3><span class="gui-date">${esc(e.from)} – ${esc(e.to)}</span></div>
                  <ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
                  <div class="gui-tags">${e.tech.map(x => `<span>${esc(x)}</span>`).join('')}</div>
                </div>`).join('')}
            </section>
            <section>
              <h2>Projects</h2>
              <div class="gui-projects">
                ${CV.projects.map(p => `
                  <a class="gui-project" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">
                    <h3>${esc(p.name)}</h3>
                    <p>${esc(p.description)}</p>
                    <div class="gui-tags">${p.tech.map(x => `<span>${esc(x)}</span>`).join('')}</div>
                  </a>`).join('')}
              </div>
            </section>
          </div>
          <aside class="gui-side">
            <section>
              <h2>Skills</h2>
              ${CV.skills.map(g => `
                <h3>${esc(g.group)}</h3>
                ${g.items.map(([n, lvl]) => `<div class="gui-skill"><span>${esc(n)}</span><span class="gui-meter"><span style="width:${lvl}%"></span></span></div>`).join('')}`).join('')}
            </section>
            <section>
              <h2>Education</h2>
              ${CV.education.map(e => `<p><strong>${esc(e.degree)}</strong><br>${esc(e.school)}<br><span class="gui-date">${esc(e.from)} – ${esc(e.to)}</span></p>`).join('')}
            </section>
            ${CV.certifications.length ? `<section><h2>Certifications</h2><ul>${CV.certifications.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : ''}
            <section>
              <h2>Languages</h2>
              <ul>${CV.languages.map(([l, lvl]) => `<li>${esc(l)} — ${esc(lvl)}</li>`).join('')}</ul>
            </section>
            <section>
              <h2>Interests</h2>
              <div class="gui-tags">${CV.interests.map(x => `<span>${esc(x)}</span>`).join('')}</div>
            </section>
          </aside>
        </div>
        <footer class="gui-footer">Psst — the terminal version has ${window.FUN.ACHIEVEMENTS.length} hidden achievements.</footer>
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

  window.GUI = { open, close };
})();
