# Projeto B — Mochileiro API (Full Cycle)

**Nível declarado: B — simples.** API REST de domínio único para consultas sobre viagens, inspirada no projeto anterior Mochileiro AI Agent. Este é um **projeto novo**, sem dependência do n8n. Não é marketplace nem possui módulos de catálogo/pedidos.

## Tecnologias

Node.js 22 (HTTP nativo, JavaScript ESM), teste nativo `node:test`, GitHub Actions, Docker Compose, OpenAPI 3.1, logs JSON, métricas Prometheus e k6. **Sem dependências npm obrigatórias.** Integração opcional ao Gemini por HTTP.

## Iniciar sem Docker (recomendado para computadores com pouco espaço)

```bash
node --version # requer >=22
npm install # não instala bibliotecas de runtime
npm start
```

Abrir `http://localhost:3000/health`. O modo padrão é `demo`: gera uma orientação determinística e **não representa IA real**.

## Iniciar com Docker (um comando)

```bash
docker compose up --build -d
```

No Docker a API ficará em `http://localhost:3000` (exposta somente na máquina local).

## Consultar uma viagem

```bash
curl -i -X POST http://localhost:3000/api/consultas \
  -H 'Content-Type: application/json' \
  -d '{"pergunta":"Quero dicas para conhecer Lisboa em três dias","sessionId":"teste-01"}'
```

Exemplo resumido de resposta demo:

```json
{"resposta":"Mochileiro (demonstração): ...","sessionId":"teste-01","provider":"demo"}
```

## Ativar o Gemini real (opcional)

Crie `.env` local copiando `.env.example`, altere `AI_PROVIDER=gemini` e configure `GEMINI_API_KEY` obtida na sua própria conta. No Node 22, execute:

```bash
node --env-file=.env src/server.js
```

No Docker Compose, ele lê as variáveis `.env` na inicialização. Nunca faça commit de `.env`. Sem chave, o modo `gemini` falha na inicialização de propósito. O modelo padrão pode ser alterado em `GEMINI_MODEL`. A integração real exige internet, chave válida, modelo disponível e disponibilidade do provedor; **não está certificada por testes reais nesta entrega**.

## Testes e CI

```bash
npm run lint
npm test
npm run coverage
npm run test:coverage # exige cobertura de linhas >= 80%
```

`lint` neste MVP significa **checagem sintática**, não aplicação de um conjunto completo de regras ESLint. Testes cobrem validação, configuração, Strategy e integração HTTP real no processo, com o Gemini simulado. A cobertura é reportada pelo Node e o pipeline exige no mínimo **80% de linhas** por `npm run test:coverage`. Em execução local de validação, foram observadas **99,33% de linhas** (15 testes aprovados). Pipeline: `.github/workflows/ci.yml` (`install`, `lint`, testes com cobertura mínima e build Docker). Para link verde, faça push ao GitHub e copie a URL de uma execução bem-sucedida na aba Actions.

## Saúde, observabilidade e SLO

- `GET /health`: healthcheck.
- `GET /metrics`: contador de requisições por rota/método/status e p95 observacional das consultas em memória; números zeram no reinício.
- Logs: JSON para stdout com `requestId`, rota, método, status e latência. Não loga a pergunta nem a chave.
- SLO inicial: **95% das consultas demo em até 500 ms** num período de 30 dias. Este é um objetivo, não um resultado já comprovado. Consultas Gemini têm desempenho externo distinto.
- Performance e reprodução: [`docs/desempenho.md`](docs/desempenho.md).

## Arquitetura e documentação

- Fluxo: Cliente → servidor HTTP → validação → `TravelService` → `TravelProvider` (`demo` ou `gemini`) → JSON.
- Padrão de projeto: **Strategy**; o serviço não conhece detalhes de API externa.
- Decisão arquitetural: [`docs/adr/0001-decisao.md`](docs/adr/0001-decisao.md).
- Contrato: [`docs/openapi.yaml`](docs/openapi.yaml) (pode abrir no Swagger Editor).
- Declaração de uso de IA: [`docs/ia.md`](docs/ia.md).
- Contribuições: [`CONTRIBUTORS.md`](CONTRIBUTORS.md).

## Limitações

Não há persistência, histórico de sessões, preço/voos ao vivo nem consulta garantida de vistos. `sessionId` só é devolvido, não ativa memória. O modo demo é para desenvolvimento e testes, não uma alternativa à IA real. A API é educacional, não possui autenticação nem limitação por usuário; não expor publicamente antes de acrescentar esses controles.

## Checklist de entrega

- [x] Projeto B, domínio único, endpoint real e Strategy justificado
- [x] Docker Compose em um comando
- [x] Testes unitários e teste de integração HTTP
- [x] Pipeline CI configurado (verde **depende de execução no GitHub**)
- [x] `.env.example` e `.gitignore`, logs estruturados, métrica, SLO definido
- [x] README, ADR, OpenAPI, k6 smoke test, `docs/desempenho.md`, `CONTRIBUTORS.md`, `docs/ia.md`
- [ ] Medição k6 real e relatório com números
- [ ] Publicação no GitHub e link da execução verde do CI
- [ ] Revisão humana e validação do provedor Gemini com credencial


### Limite de geração do Gemini

A aplicação utiliza `GEMINI_MAX_OUTPUT_TOKENS=4096` como limite
padrão de saída e timeout de 45 segundos.

O valor pode ser configurado no arquivo `.env`, dentro
do intervalo de 128 a 8192 tokens.

Se o Gemini retornar `finishReason=MAX_TOKENS`, a aplicação
tratará a resposta como erro, evitando retornar um roteiro
incompleto como se estivesse finalizado.

A integração depende de chave válida, acesso à internet,
disponibilidade do Gemini e limites da conta utilizada.
