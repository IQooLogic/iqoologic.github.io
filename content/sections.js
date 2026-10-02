/*
 * Custom sections for the GUI résumé (`gui`).
 * Define a section here, then add its name to gui.main or gui.side in site.config.js.
 * render(cv, h) returns HTML — h.esc() escapes text, h.list([...]) makes a list, h.tags([...]) makes chips.
 * Using a built-in name (e.g. 'projects') replaces that built-in section.
 */

// Example: not shown until you add 'now' to gui.main in site.config.js.
Portfolio.guiSection('now', {
  title: 'Currently',
  render: (cv, h) => h.list([
    'Exploring eBPF-based network sensors',
    'Mentoring two engineers',
    'Open to interesting security work'
  ])
});
