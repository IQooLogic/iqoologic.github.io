/*
 * ─────────────────────────────────────────────────────────────
 *  YOUR CV LIVES HERE.
 *  Everything below is EXAMPLE content — replace it with yours.
 *  The terminal, the virtual filesystem, neofetch, nmap, git log
 *  and the GUI résumé are all generated from this one object.
 * ─────────────────────────────────────────────────────────────
 */
window.CV = {
  name: 'Miloš',
  fullName: 'Miloš Example',
  handle: 'milos',
  title: 'Security Software Engineer',
  location: 'Belgrade, Serbia',
  startedCoding: 2010,
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

  skills: [
    { group: 'Languages', items: [['Go', 95], ['Python', 80], ['Bash', 85], ['C', 60], ['TypeScript', 65], ['SQL', 75]] },
    { group: 'Security', items: [['Network security', 90], ['TLS / fingerprinting', 85], ['Threat detection', 80], ['Pentesting', 70], ['Reverse engineering', 55]] },
    { group: 'Infrastructure', items: [['Linux', 95], ['Docker', 85], ['Kubernetes', 70], ['PostgreSQL', 80], ['Kafka / NATS', 75], ['Prometheus / Grafana', 80]] },
    { group: 'Practices', items: [['TDD', 85], ['Observability', 85], ['CI/CD', 80], ['System design', 80]] }
  ],

  experience: [
    {
      from: '2022-03', to: 'present',
      role: 'Senior Security Software Engineer', company: 'Northwind Security Labs', location: 'Remote',
      bullets: [
        'Designed a Go ingest pipeline handling 2M+ events/sec with p99 latency under 15 ms.',
        'Built passive TLS/TCP fingerprinting used to flag malicious clients in real time.',
        'Cut alert noise by 60% with a rule-based prefilter and deduplication layer.'
      ],
      tech: ['Go', 'NATS', 'ClickHouse', 'Kubernetes', 'Prometheus']
    },
    {
      from: '2019-06', to: '2022-02',
      role: 'Backend Engineer', company: 'Blue Lantern Systems', location: 'Belgrade',
      bullets: [
        'Migrated a Python monolith to Go services; infra cost dropped by 40%.',
        'Introduced structured logging and tracing across 30+ services.',
        'Mentored four junior engineers; two are now team leads.'
      ],
      tech: ['Go', 'Python', 'PostgreSQL', 'Docker', 'gRPC']
    },
    {
      from: '2016-09', to: '2019-05',
      role: 'Systems Administrator → DevOps', company: 'Danube Hosting', location: 'Novi Sad',
      bullets: [
        'Ran 400+ Linux servers; automated provisioning with Ansible.',
        'Built the first CI/CD pipeline at the company — deploys went from weekly to daily.'
      ],
      tech: ['Linux', 'Ansible', 'Bash', 'Nginx', 'Jenkins']
    }
  ],

  projects: [
    {
      slug: 'packetsniff',
      name: 'packetsniff',
      description: 'Zero-allocation packet parser and flow tracker for high-throughput network sensors.',
      tech: ['Go', 'eBPF', 'AF_PACKET'],
      link: 'https://github.com/your-handle/packetsniff',
      details: [
        'Parses Ethernet/IPv4/IPv6/TCP/UDP without heap allocations on the hot path.',
        'Tracks bidirectional flows with a lock-free sharded table.',
        'Benchmarked at 14 Mpps on a single core.'
      ]
    },
    {
      slug: 'honeypotd',
      name: 'honeypotd',
      description: 'Low-interaction SSH/HTTP honeypot that streams attacker behaviour as NDJSON.',
      tech: ['Go', 'SSH', 'NDJSON'],
      link: 'https://github.com/your-handle/honeypotd',
      details: [
        'Emulates a believable shell; records every keystroke.',
        'Ships events to any HTTP sink; includes Grafana dashboards.',
        'Caught 40k+ unique attacker IPs in its first month online.'
      ]
    },
    {
      slug: 'tlsprint',
      name: 'tlsprint',
      description: 'CLI and library for computing and comparing TLS client fingerprints.',
      tech: ['Go', 'TLS', 'CLI'],
      link: 'https://github.com/your-handle/tlsprint',
      details: [
        'Reads pcaps or live interfaces.',
        'Outputs fingerprints with a lookup against known clients and malware families.'
      ]
    },
    {
      slug: 'terminal-portfolio',
      name: 'terminal-portfolio',
      description: "This website. A fake Linux shell in ~2k lines of vanilla JS. You're using it right now.",
      tech: ['JavaScript', 'CSS', 'No frameworks'],
      link: 'https://github.com/your-handle/terminal-portfolio',
      details: [
        'Virtual filesystem, pipes, tab completion, fish-style autosuggestions.',
        'Hidden achievements. Have you found them all?'
      ]
    }
  ],

  education: [
    { from: '2012', to: '2016', degree: 'BSc, Computer Science', school: 'University of Belgrade', note: 'Thesis: anomaly detection in network traffic' }
  ],

  certifications: ['OSCP (example)', 'CKA (example)'],

  languages: [['Serbian', 'native'], ['English', 'fluent'], ['German', 'basic']],

  interests: ['CTFs', 'Homelab', 'Mechanical keyboards', 'Hiking', 'Coffee brewing'],

  fortunes: [
    'There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.',
    "It works on my machine. — every engineer, at least once",
    'A good error message is a love letter to your future self.',
    'Security is a process, not a product. — Bruce Schneier',
    "Don't communicate by sharing memory; share memory by communicating. — Go proverb",
    'Clear is better than clever. — Go proverb',
    'The S in IoT stands for Security.',
    'rm -rf is not a backup strategy.',
    'Real programmers count from 0.',
    'If debugging is removing bugs, programming must be putting them in.',
    'I would tell you a UDP joke, but you might not get it.',
    'Have you tried turning it off and on again? (try `reboot`)'
  ]
};
