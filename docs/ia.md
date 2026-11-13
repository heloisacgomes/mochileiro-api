
# Uso de Inteligência Artificial

## Contexto

Durante o desenvolvimento do Mochileiro API, foram
utilizadas ferramentas de inteligência artificial
como apoio à implementação, à organização da
arquitetura, à documentação e à resolução de problemas.

O projeto parte do conceito do Mochileiro AI Agent,
desenvolvido anteriormente com n8n e Gemini, e propõe
uma implementação independente em Node.js.

## Prompts relevantes

As principais solicitações utilizadas foram:

1. "Tenho um projeto para desenvolver até amanhã,
me diga se é possível nesse prazo e me diga se é
possível reutilizar o que já tenho do Mochileiro,
quero continuar ele, se couber no escopo do
novo projeto."

2. "Mas se eu não quiser continuar o n8n, não
fica melhor? Criar um novo projeto mas com
base no Mochileiro."

3. "Revise os pontos essenciais de entrega e
faça uma lista para que eu possa seguir."


## Aplicação no desenvolvimento

A assistência de IA contribuiu para:

- Análise dos requisitos do Projeto B.
- Proposição da estrutura inicial do backend.
- Geração de partes do código, testes e documentação.
- Orientações sobre integração com a API Gemini.
- Identificação e correção de problemas de configuração.
- Apoio à interpretação de resultados de testes.

## Validação prática

As atividades de configuração, execução e validação
foram realizadas no ambiente local da desenvolvedora.

Entre as verificações realizadas estão:

- Inicialização da API e teste do endpoint de saúde.
- Requisições HTTP ao endpoint de consultas.
- Configuração e teste real da integração Gemini.
- Correção do limite de geração de respostas.
- Execução de testes automatizados.
- Execução de smoke test com Grafana k6.
- Registro das métricas reais de desempenho.

## Exemplos de solicitações à IA

- Apoio à identificação dos requisitos técnicos
  e documentos necessários ao Projeto B.
- Proposição de uma API independente do n8n,
  preservando o conceito original do Mochileiro.
- Auxílio na implementação do padrão Strategy
  para abstrair os provedores de resposta.
- Investigação de falhas nos testes automatizados
  e na configuração do Gemini.
- Orientação para testes de desempenho e
  documentação dos resultados.

## Responsabilidade técnica

A utilização de inteligência artificial não substitui
a compreensão, a revisão e a validação técnica.

A responsabilidade pela entrega, pelas configurações
utilizadas, pela verificação dos resultados e pelas
decisões finais do projeto é da desenvolvedora.
