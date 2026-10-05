/* Skills, grouped. Each item is [name, level 0–100]. */
Portfolio.content({
  skills: [
    { group: 'Languages', items: [['Go', 95], ['Java', 95], ['SQL', 85], ['JavaScript / TypeScript', 75], ['C#', 70], ['Rust', 60], ['C / C++', 55]] },
    { group: 'Security', items: [['SIEM / log pipelines', 95], ['Honeypots / deception', 90], ['Network fingerprinting (JA4+)', 90], ['Threat intelligence (STIX/TAXII)', 85], ['Auth & key management (Ed25519)', 85], ['MicroVM sandboxing (Firecracker)', 80], ['DNS filtering', 80]] },
    { group: 'Backend & Systems', items: [['High-throughput pipelines', 95], ['Distributed systems', 90], ['Concurrency', 90], ['REST APIs / Spring', 90], ['Durable queuing', 85]] },
    { group: 'Data & ML', items: [['PostgreSQL / pgvector', 85], ['Elasticsearch / OpenSearch', 85], ['DuckDB / S3 / Parquet', 80], ['MongoDB / MySQL', 75], ['PyTorch / NLP classification', 70], ['Anomaly detection', 75]] },
    { group: 'Infrastructure', items: [['Linux', 90], ['Docker (distroless)', 90], ['CI/CD', 85], ['Prometheus / Grafana', 80], ['Local LLMs (Ollama)', 70]] },
    { group: 'Practices', items: [['Stdlib-first Go', 95], ['Table-driven testing', 90], ['Mentoring & code review', 90], ['Engineering standards', 90], ['Specs & ADRs', 85]] }
  ]
});
