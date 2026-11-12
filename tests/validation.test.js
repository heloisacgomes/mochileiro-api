
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateConsulta } from '../src/validation.js';
import { loadConfig } from '../src/config.js';
import { TravelService } from '../src/service.js';
import {
  GeminiTravelProvider,
  createTravelProvider
} from '../src/providers.js';
import { Metrics } from '../src/observability.js';

// TESTE 1 — Validação de entrada
test('valida e normaliza uma consulta', () => {
  assert.deepEqual(
    validateConsulta({
      pergunta: '  Quero visitar Lisboa  ',
      sessionId: 'abc_1'
    }),
    {
      pergunta: 'Quero visitar Lisboa',
      sessionId: 'abc_1'
    }
  );
});

// TESTE 2 — Rejeição de entradas inválidas
test('rejeita perguntas inválidas, sessões inválidas e listas', () => {
  const invalidos = [
    null,
    [],
    {},
    { pergunta: 'curta' },
    { pergunta: 'x'.repeat(1001) },
    {
      pergunta: 'Quero ir a Paris',
      sessionId: '../../segredo'
    }
  ];

  for (const value of invalidos) {
    assert.throws(() => validateConsulta(value));
  }
});

// TESTE 3 — Configurações inválidas
test('configuração impede provedor ou porta inválida e Gemini sem chave', () => {
  assert.throws(() => loadConfig({ PORT: '0' }));

  assert.throws(() => loadConfig({
    AI_PROVIDER: 'outro'
  }));

  assert.throws(() => loadConfig({
    AI_PROVIDER: 'gemini'
  }));

  assert.equal(loadConfig({}).provider, 'demo');
});

// TESTE 4 — Strategy Pattern
test('Strategy permite trocar provedor sem alterar serviço', async () => {
  const service = new TravelService(
    createTravelProvider({ provider: 'demo' })
  );

  const data = await service.consultar({
    pergunta: 'Quero conhecer Lisboa',
    sessionId: 's1'
  });

  assert.match(data.resposta, /Mochileiro/);
  assert.equal(data.sessionId, 's1');
  assert.equal(data.provider, 'demo');
});

// TESTE 5 — Resposta simulada do Gemini
test('Gemini converte o retorno da API externa', async () => {
  const provider = new GeminiTravelProvider({
    apiKey: 'fake',
    model: 'gemini-test',

    fetchImpl: async (url, opts) => {
      assert.match(url, /generateContent/);
      assert.equal(
        opts.headers['x-goog-api-key'],
        'fake'
      );

      return {
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'Roteiro pronto'
              }]
            }
          }]
        })
      };
    }
  });

  assert.equal(
    await provider.gerarResposta('Faça um roteiro de Lisboa'),
    'Roteiro pronto'
  );
});

// TESTE 6 — Erro HTTP e resposta vazia
test('Gemini trata erro HTTP ou resposta vazia', async () => {
  const respostasSimuladas = [
    async () => ({
      ok: false,
      status: 429
    }),

    async () => ({
      ok: true,
      json: async () => ({
        candidates: []
      })
    })
  ];

  for (const fake of respostasSimuladas) {
    const provider = new GeminiTravelProvider({
      apiKey: 'fake',
      model: 'test',
      fetchImpl: fake
    });

    await assert.rejects(
      () => provider.gerarResposta('Uma viagem para Lisboa')
    );
  }
});

// TESTE 7 — Métricas e observabilidade
test('Métricas acompanham total e percentil aproximado', () => {
  const metrics = new Metrics();

  metrics.record('/api/consultas', 'POST', 200, 120);
  metrics.record('/api/consultas', 'POST', 400, 200);

  assert.equal(
    metrics.getSnapshot().p95_seconds,
    0.2
  );

  assert.match(
    metrics.toPrometheus(),
    /http_requests_total/
  );
});

// TESTE 8 — Limite de tokens do Gemini
test('Gemini configura limite maior e detecta saída interrompida', async () => {
  const config = loadConfig({
    AI_PROVIDER: 'gemini',
    GEMINI_API_KEY: 'fake',
    GEMINI_MAX_OUTPUT_TOKENS: '4096'
  });

  assert.equal(config.maxOutputTokens, 4096);

  assert.throws(() =>
    loadConfig({
      GEMINI_MAX_OUTPUT_TOKENS: '-1'
    })
  );

  const provider = new GeminiTravelProvider({
    apiKey: 'fake',
    model: 'gemini-test',
    maxOutputTokens: 4096,

    fetchImpl: async (_url, opts) => {
      const body = JSON.parse(opts.body);

      assert.equal(
        body.generationConfig.maxOutputTokens,
        4096
      );

      return {
        ok: true,
        json: async () => ({
          candidates: [{
            finishReason: 'MAX_TOKENS',
            content: {
              parts: [{
                text: 'parcial'
              }]
            }
          }]
        })
      };
    }
  });

  await assert.rejects(
    () => provider.gerarResposta(
      'Roteiro de três dias em Paris'
    ),
    /limite de tokens/
  );
});
