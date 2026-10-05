/* Who you are. The banner, prompt, neofetch, boot log and GUI résumé all read from here. */
Portfolio.content({
  name: 'Miloš',
  fullName: 'Miloš Stojković',
  handle: 'milos',
  title: 'Senior Software Engineer — Cybersecurity & Distributed Systems',
  location: 'Niš, Serbia',
  startedCoding: 2010,               // used for uptime / neofetch / git log

  // Big block letters on the welcome screen (A–Z, 0–9, - _ . ! ?). Defaults to `handle`.
  // For hand-made ASCII art instead, set bannerArt: String.raw`...` and it wins.
  banner: 'milos',

  // Photo for the GUI résumé, e.g. 'assets/me.jpg' (put the file next to index.html). null = initial letter.
  avatar: null,

  tagline: '15+ years building security infrastructure and high-throughput backends — and thinking like the people trying to break them.',

  about: [
    "Hi, I'm Miloš. I co-founded Advanced Security Technologies (AST) in 2012, and I have built its core cybersecurity products in Go and Java ever since: SIEM and log search, IoT honeypots and deception, network fingerprinting, threat intelligence and network prevention.",
    'My work lives where scale meets hostility: ingestion pipelines that move billions of events without losing one after a crash, sensors that run in adversarial networks, and sandboxes that run untrusted code in single-use Firecracker microVMs.',
    'I prefer explicit over clever, stdlib-first Go, errors that fail loudly with context, and table-driven tests that actually test something. golangci-lint is green before anything ships, and decisions get written down as specs and ADRs.',
    'I also teach Java at IT Centar (since 2015), mentor engineers, and set the engineering standards and code-review practices my team works by.'
  ],

  contact: {
    email: 'iqoologic@gmail.com',
    github: 'https://github.com/iqoologic'
  },

  languages: [['Serbian', 'native'], ['English', 'advanced']],

  interests: ['Teaching', 'Mentoring', 'Deception technology', 'Local LLMs', 'Game development', 'Open-source education']
});
