import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { ValidationError, validateConsulta } from './validation.js';
import { Metrics, logEvent } from './observability.js';

function reply(res, status, value, extra = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), ...extra });
  res.end(body);
}

async function jsonBody(req, limit) {
  let count = 0;
  const chunks = [];
  for await (const chunk of req) {
    count += chunk.length;
    if (count > limit) throw Object.assign(new Error('Corpo excede o limite de 8 KiB'), { status: 413 });
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ValidationError('JSON inválido'); }
  return value;
}

export function createApp({ service, metrics = new Metrics(), logger = logEvent, maxBodyBytes = 8192 }) {
  const server = createServer(async (req, res) => {
    const started = performance.now();
    const requestId = randomUUID();
    const route = (req.url ?? '').split('?')[0];
    let status = 500;
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      if (req.method === 'GET' && route === '/health') {
        status = 200;
        reply(res, status, { status: 'ok', service: 'mochileiro-api' });
      } else if (req.method === 'GET' && route === '/metrics') {
        status = 200;
        res.writeHead(status, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
        res.end(metrics.toPrometheus());
      } else if (route === '/api/consultas' && req.method === 'POST') {
        if (!(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) {
          status = 415;
          reply(res, status, { erro: 'Use Content-Type: application/json', requestId });
        } else {
          const payload = validateConsulta(await jsonBody(req, maxBodyBytes));
          const output = await service.consultar(payload);
          status = 200;
          reply(res, status, output);
        }
      } else {
        status = route === '/api/consultas' ? 405 : 404;
        reply(res, status, { erro: status === 405 ? 'Método não permitido' : 'Rota não encontrada', requestId }, status === 405 ? { Allow: 'POST' } : {});
      }
    } catch (err) {
      status = err instanceof ValidationError ? 400 : (err?.status === 413 ? 413 : 502);
      reply(res, status, { erro: status === 502 ? 'Falha ao consultar serviço de viagem' : err.message, requestId });
      if (status === 502) logger({ level: 'error', requestId, event: 'provider_failure', message: err?.message ?? 'erro desconhecido' });
    } finally {
      const elapsedMs = performance.now() - started;
      const safeRoute = ['/health', '/metrics', '/api/consultas'].includes(route) ? route : 'not_found';
      metrics.record(safeRoute, req.method ?? 'UNKNOWN', status, elapsedMs);
      // Não registrar prompts, tokens ou dados pessoais nos logs.
      logger({ level: 'info', event: 'request_finished', requestId, route: safeRoute, method: req.method, status, elapsedMs: Number(elapsedMs.toFixed(2)) });
    }
  });
  return { server, metrics };
}
