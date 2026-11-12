
# ADR 0001 — Arquitetura independente para o Mochileiro API

**Status:** Aceita  
**Data:** 12/11/2026  
**Projeto:** Mochileiro API

## 1. Contexto

O Mochileiro surgiu como um agente de inteligência
artificial para assistência em viagens, desenvolvido
com n8n e integração ao Google Gemini.

Para esta versão, o objetivo é construir uma API REST
independente, com domínio único e organização
compatível com os requisitos do Projeto B — Full Cycle.

A solução precisa permitir testes automatizados,
execução padronizada, integração com serviços externos,
observabilidade e documentação da arquitetura.

## 2. Decisão

Foi adotada uma arquitetura em camadas utilizando
Node.js 22, JavaScript ESM e o módulo HTTP nativo.

A aplicação está organizada em responsabilidades:

- Camada HTTP: recebimento e retorno das requisições.
- Validação: verificação dos dados de entrada.
- Serviço: execução do caso de uso de consulta.
- Provedores: implementação das estratégias de resposta.
- Observabilidade: logs, métricas e monitoramento.

Foi escolhido o padrão de projeto Strategy para
permitir a utilização de diferentes provedores
sem modificar o fluxo principal do serviço.

As estratégias implementadas são:

- DemoTravelProvider: respostas determinísticas para
  desenvolvimento e testes.
- GeminiTravelProvider: integração HTTP com o Google
  Gemini para geração de respostas personalizadas.

## 3. Justificativa

A utilização do HTTP nativo reduz dependências
obrigatórias e mantém a implementação enxuta.

O padrão Strategy permite desacoplar a lógica
da aplicação da tecnologia utilizada para
produzir as respostas.

Essa separação contribui para:

- Organização e manutenção do código.
- Testabilidade das regras e integrações.
- Substituição ou inclusão de novos provedores.
- Execução de testes sem consumir a API Gemini.
- Maior controle sobre tratamento de erros.

A decisão está alinhada ao princípio de inversão
de dependências, pois o serviço utiliza uma interface
de comportamento, sem depender diretamente dos
detalhes HTTP do provedor externo.

## 4. Alternativas consideradas

### Manter o n8n como backend

Permitiria reutilizar diretamente o workflow original,
mas manteria a nova aplicação dependente de uma
plataforma externa de automação.

A alternativa foi descartada para permitir
desenvolvimento e execução independentes da API.

### Express e SDK oficial do Gemini

Ofereceriam abstrações adicionais de roteamento
e integração.

Entretanto, para o escopo reduzido da API, a
implementação nativa foi considerada suficiente,
evitando dependências obrigatórias adicionais.

## 5. Consequências positivas

- API independente do n8n.
- Separação entre serviço e integração externa.
- Testes determinísticos com provedor demonstrativo.
- Possibilidade de execução local e em container.
- Menor quantidade de dependências de runtime.
- Estrutura extensível para novas funcionalidades.

## 6. Limitações e trade-offs

- Roteamento e validação HTTP exigem manutenção manual.
- Não existe persistência de consultas ou sessões.
- O sessionId é devolvido, mas não implementa memória.
- A integração Gemini depende de serviço externo.
- O modo demo não produz recomendações personalizadas.
- Ferramentas específicas do workflow original,
  como consultas de voos, não foram integralmente
  migradas para esta versão.

## 7. Conclusão

A arquitetura escolhida atende à proposta de uma
API de domínio único, priorizando organização,
simplicidade, testes automatizados e separação
de responsabilidades.

O padrão Strategy oferece flexibilidade para
evoluções futuras sem aumentar desnecessariamente
a complexidade da implementação inicial.
