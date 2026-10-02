/* Jobs, newest first. `from`/`to` are YYYY-MM (or "present"). */
Portfolio.content({
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
  ]
});
