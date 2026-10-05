/* Projects. `slug` becomes the file name in ~/projects and the argument to `projects <slug>`. `link` is optional. */
Portfolio.content({
  projects: [
    {
      slug: 'log-search',
      name: 'Log ingestion & search platform',
      description: 'High-throughput SIEM ingestion and search over billions of events, built at AST.',
      tech: ['Go', 'Durable queuing', 'OpenSearch'],
      details: [
        'Processes billions of events (2.5+ TB) with sub-second query latency.',
        'Crash-durable processing: no events lost on restart.',
        'Fed by a high-volume Windows log-forwarding agent that emits structured JSON.'
      ]
    },
    {
      slug: 'fingerprint-intel',
      name: 'Network-fingerprint intelligence',
      description: 'Go service that ingests, clusters and searches network fingerprints (JA4+) at scale, built at AST.',
      tech: ['Go', 'JA4+', 'Vector search', 'Tiered storage'],
      details: [
        'Large-scale fingerprint ingestion.',
        'Structural and vector-based similarity search.',
        'Automatic clustering and tiered long-term storage.'
      ]
    },
    {
      slug: 'threat-intel',
      name: 'AI/ML threat-intelligence pipeline',
      description: 'Correlates live attacker telemetry and publishes structured intelligence feeds, built at AST.',
      tech: ['Go', 'ML', 'STIX/TAXII', 'REST'],
      details: [
        'Correlates live attacker telemetry and detects novel attack patterns.',
        'Distributes intelligence feeds over REST and STIX/TAXII to downstream prevention systems.',
        'Feeds a DNS threat-prevention server that blocks malicious domains and IPs in real time.'
      ]
    },
    {
      slug: 'microvm-sandbox',
      name: 'MicroVM sandbox',
      description: 'Firecracker-based sandbox for safe, isolated execution and analysis of untrusted code, built at AST.',
      tech: ['Firecracker', 'Linux', 'Go'],
      details: [
        'Every run gets an ephemeral, single-use microVM.',
        'Untrusted code never touches the host.'
      ]
    },
    {
      slug: 'guardianeye',
      name: 'GuardianEye',
      description: 'PyTorch model-training pipeline that classifies toxic and harmful online conversations.',
      tech: ['PyTorch', 'NLP', 'Text classification'],
      details: [
        'Part of an Interreg Bulgaria–Serbia cross-border security initiative, with AST as Lead Partner.',
        'Designed the training pipeline and trained the classification models.'
      ]
    },
    {
      slug: 'edu-platform',
      name: 'Programming-education platform',
      description: 'Open-source, self-hostable platform for teaching programming, with sandboxed code execution. In progress.',
      tech: ['Sandboxing', 'Self-hosted', 'Open source'],
      details: [
        'Built alongside teaching Java at IT Centar.',
        'Sandboxed code execution and course tooling.'
      ]
    },
    {
      slug: 'codemancy-games',
      name: 'Codemancy Games',
      description: 'Core systems designer and team lead, 2014–2016.',
      tech: ['Unity3D', 'C#'],
      details: ['Designed the core game systems and led the team.']
    },
    {
      slug: 'humanizator',
      name: 'Humanizator',
      description: 'Team lead and core system designer, 2015.',
      tech: ['Java', 'Spring', 'Protocol Buffers'],
      details: ['Led the team and designed the core system.']
    },
    {
      slug: 'terminal-portfolio',
      name: 'terminal-portfolio',
      description: "This website. A fake Linux shell in vanilla JS. You're using it right now.",
      tech: ['JavaScript', 'CSS', 'No frameworks'],
      details: [
        'Virtual filesystem, pipes, tab completion, fish-style autosuggestions.',
        'Hidden achievements. Have you found them all?'
      ]
    }
  ]
});
