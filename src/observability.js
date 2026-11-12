export class Metrics {
  constructor() { this.counts = new Map(); this.latencies = []; }
  record(route, method, status, elapsedMs) {
    const key = `${route}|${method}|${status}`;
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
    if (route === '/api/consultas') {
      this.latencies.push(elapsedMs / 1000);
      if (this.latencies.length > 10000) this.latencies.shift();
    }
  }
  getSnapshot() {
    const durations = [...this.latencies].sort((a,b) => a-b);
    return { requests: [...this.counts.entries()], samples: durations.length, p95_seconds: durations.length ? durations[Math.ceil(durations.length * 0.95) - 1] : null };
  }
  toPrometheus() {
    const lines = ['# HELP http_requests_total Total de requisições', '# TYPE http_requests_total counter'];
    for (const [key, value] of this.counts) {
      const [route, method, status] = key.split('|');
      lines.push(`http_requests_total{route="${route}",method="${method}",status="${status}"} ${value}`);
    }
    lines.push('# HELP mochileiro_consulta_duration_seconds Duração das consultas', '# TYPE mochileiro_consulta_duration_seconds summary');
    const snapshot = this.getSnapshot();
    lines.push(`mochileiro_consulta_duration_seconds_count ${snapshot.samples}`);
    if (snapshot.p95_seconds !== null) lines.push(`mochileiro_consulta_duration_seconds{quantile="0.95"} ${snapshot.p95_seconds}`);
    return lines.join('\n') + '\n';
  }
}

export function logEvent(entry, out = console.log) {
  out(JSON.stringify({ ts: new Date().toISOString(), ...entry }));
}
