/* Projects. `slug` becomes the file name in ~/projects and the argument to `projects <slug>`. */
Portfolio.content({
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
  ]
});
