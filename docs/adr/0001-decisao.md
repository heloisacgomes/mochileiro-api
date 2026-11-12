# ADR 0001 — API independente do n8n

- **Status:** aceita
- **Data:** 2026-11-12
- **Contexto:** o projeto Mochileiro original usava workflows do n8n; a versão de entrega precisa demonstrar API de domínio único, testes e CI. O acesso ao n8n Cloud expirou e há pouco espaço livre no computador de desenvolvimento.
- **Decisão:** desenvolver uma API HTTP Node.js 22 sem dependências obrigatórias. Usar o **Strategy Pattern** para alternar entre um provedor determinístico de demonstração e o Gemini via HTTP. Manter a pergunta de viagem como o único caso de uso.
- **Alternativa descartada:** reativar n8n com Docker; acrescentaria operação local de um serviço externo que não é essencial ao domínio e poderia exigir espaço de armazenamento adicional.
- **Outra alternativa:** Express + SDK Gemini. É válida e facilitaria certas abstrações, mas exige download de pacotes em um ambiente com restrições de espaço e não traz vantagem essencial para o escopo do Projeto B.
- **Consequências positivas:** execução imediata com Node.js 22; CI sem chave de IA; testes previsíveis; desacoplamento de fornecedor.
- **Trade-offs:** roteamento e validação HTTP precisam de manutenção manual; não há conversas persistidas; modo demo não produz recomendações personalizadas; integrações do n8n original não foram migradas.
