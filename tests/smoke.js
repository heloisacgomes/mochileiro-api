import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
export default function () {
  const r = http.post(`${baseUrl}/api/consultas`, JSON.stringify({ pergunta: 'Quero conhecer Lisboa em três dias', sessionId: 'k6-test' }), { headers: { 'Content-Type': 'application/json' } });
  check(r, { 'status 200': res => res.status === 200, 'resposta presente': res => Boolean(res.json('resposta')) });
  sleep(1);
}
