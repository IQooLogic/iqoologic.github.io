/* Who you are. The banner, prompt, neofetch, boot log and GUI résumé all read from here. */
Portfolio.content({
  name: 'Miloš',
  fullName: 'Miloš Example',
  handle: 'milos',
  title: 'Security Software Engineer',
  location: 'Belgrade, Serbia',
  startedCoding: 2010,               // used for uptime / neofetch / git log

  // Big block letters on the welcome screen (A–Z, 0–9, - _ . ! ?). Defaults to `handle`.
  // For hand-made ASCII art instead, set bannerArt: String.raw`...` and it wins.
  banner: 'milos',

  // Photo for the GUI résumé, e.g. 'assets/me.jpg' (put the file next to index.html). null = initial letter.
  avatar: null,

  tagline: 'I build fast, boring-in-a-good-way backend systems — and I think like the people trying to break them.',

  about: [
    "Hi, I'm Miloš. I write backend and security tooling, mostly in Go, mostly on Linux, mostly with too much coffee.",
    'I like systems that are explicit over clever, fail loudly instead of silently, and come with tests that actually test something.',
    'Day to day I work on network telemetry, detection pipelines and the plumbing that moves millions of events per second without dropping any on the floor.',
    "Outside of work: CTFs, homelab tinkering, mechanical keyboards, and arguing that tabs vs. spaces is solved (gofmt decides)."
  ],

  contact: {
    email: 'you@example.com',
    github: 'https://github.com/your-handle',
    linkedin: 'https://www.linkedin.com/in/your-handle',
    website: 'https://example.com'
  },

  languages: [['Serbian', 'native'], ['English', 'fluent'], ['German', 'basic']],

  interests: ['CTFs', 'Homelab', 'Mechanical keyboards', 'Hiking', 'Coffee brewing']
});
