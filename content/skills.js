/* Skills, grouped. Each item is [name, level 0–100]. */
Portfolio.content({
  skills: [
    { group: 'Languages', items: [['Go', 95], ['Python', 80], ['Bash', 85], ['C', 60], ['TypeScript', 65], ['SQL', 75]] },
    { group: 'Security', items: [['Network security', 90], ['TLS / fingerprinting', 85], ['Threat detection', 80], ['Pentesting', 70], ['Reverse engineering', 55]] },
    { group: 'Infrastructure', items: [['Linux', 95], ['Docker', 85], ['Kubernetes', 70], ['PostgreSQL', 80], ['Kafka / NATS', 75], ['Prometheus / Grafana', 80]] },
    { group: 'Practices', items: [['TDD', 85], ['Observability', 85], ['CI/CD', 80], ['System design', 80]] }
  ]
});
