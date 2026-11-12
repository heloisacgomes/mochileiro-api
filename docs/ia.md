# Declaração de uso de IA

A assistência de IA foi utilizada na elaboração inicial do projeto e da documentação. A pessoa responsável pela entrega deve revisar, compreender, executar e assumir as decisões técnicas.

## Prompts relevantes (resumo fiel do pedido)

1. “Revise os pontos essenciais de entrega e faça exatamente todos eles” — checklist dos slides do Projeto B (Full Cycle): domínio único, Compose, padrão justificado, testes, cobertura, CI, .env.example, logs, métrica, SLO, README, ADR, OpenAPI e smoke k6.
2. “Quero criar outro projeto” — exigência de novo repositório, separado do Mochileiro original.
3. “Mas se eu não quiser continuar o n8n, não fica melhor? Criar um novo projeto mas com base no Mochileiro” — nova API autônoma baseada no conceito do agente anterior.

## Decisões propostas pela IA, a revisar

- Node.js 22 sem dependências obrigatórias, em vez de Express/TypeScript, para minimizar instalação e armazenamento.
- Strategy Pattern com `DemoTravelProvider` e `GeminiTravelProvider`.
- Endpoint principal `POST /api/consultas`.
- Teste de CI com provedor demo, sem segredos.

## Responsabilidade

A estudante deve validar configuração, executar testes e CI, realizar e registrar medição real do k6 e revisar toda a implementação antes de entregar. Não declarar que medições ou deploy ocorreram quando não ocorreram.
