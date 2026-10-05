/*
 * Custom sections for the GUI résumé (`gui`).
 * Define a section here, then add its name to gui.main or gui.side in site.config.js.
 * render(cv, h) returns HTML — h.esc() escapes text, h.list([...]) makes a list, h.tags([...]) makes chips.
 * Using a built-in name (e.g. 'projects') replaces that built-in section.
 */

Portfolio.guiSection('now', {
  title: 'Currently',
  render: (cv, h) => h.list([
    'AI/ML-driven threat intelligence at AST',
    'Building an open-source programming-education platform',
    'Teaching Java and mentoring engineers'
  ])
});

Portfolio.guiSection('publications', {
  title: 'Publications',
  render: (cv, h) => h.list(['“Smart TV Application based on Web 2.0” — YU Info Conference, 2012 (Stojković, Stošović)'])
});
