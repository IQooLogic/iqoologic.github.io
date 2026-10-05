/* Jobs, newest first. `from`/`to` are YYYY-MM (or "present"). */
Portfolio.content({
  experience: [
    {
      from: '2012', to: 'present',
      role: 'Co-Founder & Senior Software Engineer', company: 'Advanced Security Technologies (AST)', location: 'Serbia',
      bullets: [
        "Architect and build AST's core cybersecurity products in Go and Java: threat detection, deception, threat intelligence and network prevention.",
        'Designed and optimized a log-ingestion and search platform: billions of events (2.5+ TB), sub-second queries, crash-durable processing.',
        'Built a Go network-fingerprint intelligence service: large-scale ingestion, structural and vector similarity search, automatic clustering, tiered long-term storage.',
        'Architected an AI/ML threat-intelligence pipeline that correlates live attacker telemetry, detects novel attack patterns and serves REST and STIX/TAXII feeds to prevention systems.',
        'Built a Firecracker microVM sandbox for isolated analysis of untrusted code in ephemeral, single-use environments.',
        'Built a DNS threat-prevention server that blocks malicious domains and IPs in real time from live intelligence feeds.',
        'Designed authentication and key management for distributed sensor nodes in untrusted, adversarial environments.',
        'Built a high-volume Windows log-forwarding agent that emits structured JSON to the ingestion platform.',
        'Designed and trained a PyTorch pipeline that classifies toxic and harmful conversations for GuardianEye (Interreg Bulgaria–Serbia; AST as Lead Partner).',
        'Mentor engineers and define team-wide engineering standards, conventions and code-review practices.'
      ],
      tech: ['Go', 'Java', 'PyTorch', 'PostgreSQL', 'OpenSearch', 'Firecracker', 'STIX/TAXII', 'Docker']
    },
    {
      from: '2015', to: 'present',
      role: 'Java Instructor', company: 'IT Centar', location: 'Serbia',
      bullets: [
        'Teach Java to technical and non-technical students by building desktop, web and REST API applications.',
        'Building an open-source, self-hostable programming-education platform with sandboxed code execution and course tooling.'
      ],
      tech: ['Java', 'Spring', 'REST APIs', 'Sandboxing']
    },
    {
      from: '2012', to: '2013',
      role: 'Java / Android Developer', company: 'NissaTech Research Center', location: 'Serbia',
      bullets: ['Built a REST API and an Android app with Bluetooth device integration.'],
      tech: ['Java', 'Android', 'Bluetooth', 'REST']
    },
    {
      from: '2012', to: '2013',
      role: 'Java Developer', company: 'ARMA Digital', location: 'Serbia',
      bullets: ['Developed Spring / Java web applications.'],
      tech: ['Java', 'Spring']
    },
    {
      from: '2010', to: '2012',
      role: 'Developer', company: 'Samsung / VTS Apps Team', location: 'Serbia',
      bullets: [
        'Built Smart TV and Bada applications.',
        'Awarded for the best Smart TV application.'
      ],
      tech: ['Smart TV', 'Bada', 'JavaScript']
    },
    {
      from: '2010', to: '2010',
      role: 'Front-End Developer', company: 'ATES International', location: 'Serbia',
      bullets: ['Web front-end development.'],
      tech: ['HTML', 'CSS', 'JavaScript']
    }
  ]
});
