import { test, before, after } from 'node:test';import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { TravelService } from '../src/service.js';
import { DemoTravelProvider } from '../src/providers.js';

let server, url, logs;
before(async () => {
  logs = [];
  ({ server } = createApp({ service: new TravelService(new DemoTravelProvider()), logger: entry => logs.push(entry) }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });

test('GET /health responde 200', async () => {
  const r = await fetch(`${url}/health`);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).status, 'ok');
});
test('POST /api/consultas fluxo de ponta a ponta', async () => {
  const r = await fetch(`${url}/api/consultas`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pergunta: 'Quero conhecer Portugal', sessionId: 's-1' }) });
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.match(body.resposta, /Portugal/);
  assert.equal(body.sessionId, 's-1');
  assert.ok(r.headers.get('x-request-id'));
});
test('payload inválido retorna 400', async () => {
  const r = await fetch(`${url}/api/consultas`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pergunta: 'oi' }) });
  assert.equal(r.status, 400);
});
test('JSON malformado retorna 400', async () => {
  const r = await fetch(`${url}/api/consultas`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{errado' });
  assert.equal(r.status, 400);
});
test('content-type inválido retorna 415', async () => {
  const r = await fetch(`${url}/api/consultas`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'teste' });
  assert.equal(r.status, 415);
});
test('method inválido retorna 405 e rota inexistente 404', async () => {
  assert.equal((await fetch(`${url}/api/consultas`)).status, 405);
  assert.equal((await fetch(`${url}/inexistente`)).status, 404);
});
test('GET /metrics expõe métrica Prometheus e há logs estruturados', async () => {
  const r = await fetch(`${url}/metrics`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /mochileiro_consulta_duration_seconds/);
  assert.ok(logs.some(v => v.event === 'request_finished'));
});

test('falha de provedor devolve 502 sem vazar detalhes', async () => {
  const { server: other } = createApp({ service: { consultar: async () => { throw Error('GEMINI_API_KEY=supersecreto'); } }, logger: () => {} });
  await new Promise(resolve => other.listen(0, '127.0.0.1', resolve));
  try {
    const r = await fetch(`http://127.0.0.1:${other.address().port}/api/consultas`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pergunta: 'Viagem para Fortaleza' }) });
    assert.equal(r.status, 502);
    assert.doesNotMatch(await r.text(), /supersecreto/);
  } finally { await new Promise(resolve => other.close(resolve)); }
});
