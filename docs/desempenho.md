
# Relatório de Desempenho — Mochileiro API

## 1. Objetivo

Validar o funcionamento e a latência do endpoint
POST /api/consultas por meio de um smoke test
executado com Grafana k6.

## 2. Ambiente

- Data: 12/11/2026
- Ambiente: local (macOS)
- Ferramenta: Grafana k6 v2.4.0
- Aplicação: Mochileiro API
- Provedor: demo
- Endpoint: POST /api/consultas
- Usuários virtuais: 1
- Duração do teste: 30 segundos
- Total de requisições: 30

O teste utilizou o provedor demonstrativo, sem
chamadas externas ao Gemini.

## 3. Critérios de aceitação

- Latência p95 inferior a 500 ms
- Taxa de falhas inferior a 1%
- Resposta HTTP 200
- Presença do campo resposta no JSON

## 4. Resultados

| Métrica | Resultado |
|---|---|
| Requisições totais | 30 |
| Verificações realizadas | 60 |
| Verificações aprovadas | 100% |
| Taxa de falhas HTTP | 0,00% |
| Latência média | 5,86 ms |
| Latência mediana | 1,47 ms |
| Latência p90 | 2,77 ms |
| Latência p95 | 3,42 ms |
| Latência máxima | 125,4 ms |
| Requisições por segundo | 0,99 |

## 5. Avaliação dos thresholds

### Latência p95

- Threshold: p95 < 500 ms
- Resultado: 3,42 ms
- Status: APROVADO

### Taxa de falhas

- Threshold: rate < 0.01
- Resultado: 0,00%
- Status: APROVADO

## 6. Interpretação

A API apresentou baixa latência no cenário testado.

As 30 requisições foram concluídas sem falhas HTTP,
e todas as 60 verificações foram aprovadas.

O p95 de 3,42 ms ficou abaixo do limite definido
de 500 ms.

O resultado demonstra o funcionamento da API
sob carga mínima, em ambiente local.

## 7. Limitações

Este foi um smoke test com apenas um usuário
virtual e não representa um teste de carga
ou de estresse.

A execução utilizou o provedor demo, portanto
não mediu a latência da API Gemini.

Também não foram avaliadas concorrência elevada,
disponibilidade em produção ou escalabilidade.

## 8. Próximos passos

- Validar a aplicação em Docker Compose.
- Executar testes adicionais com maior concorrência.
- Avaliar separadamente a latência da integração Gemini.
- Monitorar erros e latência em execução contínua.

## 9. Conclusão

O Mochileiro API atendeu aos thresholds definidos
para o smoke test local.

Resultado final: APROVADO.