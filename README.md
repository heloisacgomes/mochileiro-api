# Mochileiro API

API REST para assistência inteligente no planejamento
de viagens, desenvolvida com Node.js e integração
ao Google Gemini.

O Mochileiro API é uma evolução do conceito do
[Mochileiro AI Agent](https://github.com/heloisacgomes/mochileiro-ai-agent),
projeto desenvolvido anteriormente com n8n.

Nesta versão, a aplicação possui backend próprio,
sem dependência do n8n, com foco em organização
de código, testes automatizados, observabilidade
e execução padronizada.

**Projeto Final Full Cycle — Projeto B (Simples)**

## Funcionalidades

- Receber consultas sobre destinos e viagens.
- Gerar orientações personalizadas com Google Gemini.
- Disponibilizar respostas demonstrativas para testes.
- Validar dados recebidos nas requisições.
- Tratar erros de entrada e de serviços externos.
- Disponibilizar healthcheck e métricas HTTP.
- Registrar logs estruturados das requisições.

## Tecnologias

- Node.js 22
- JavaScript (ES Modules)
- HTTP nativo do Node.js
- Google Gemini API
- Node Test Runner
- Docker e Docker Compose
- GitHub Actions
- OpenAPI 3.1
- Grafana k6

A implementação não exige bibliotecas npm externas
para executar a aplicação.

## Arquitetura

A aplicação utiliza separação de responsabilidades
e o padrão de projeto Strategy para desacoplar
o serviço principal dos provedores de resposta.

Fluxo principal:

Cliente
  |
  v
API HTTP
  |
  v
Validação da consulta
  |
  v
TravelService
  |
  v
TravelProvider
  |
  +-- DemoTravelProvider
  |
  +-- GeminiTravelProvider
  |
  v
Resposta JSON

O Strategy Pattern permite alternar o provedor
sem modificar a lógica principal do serviço.

A decisão arquitetural está documentada em:
[ADR 0001](docs/adr/0001-decisao.md).

## Estrutura do projeto

```text
mochileiro-api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── adr/
│   │   └── 0001-decisao.md
│   ├── desempenho.md
│   ├── ia.md
│   └── openapi.yaml
├── scripts/
│   └── check-coverage.js
├── src/
│   ├── app.js
│   ├── config.js
│   ├── observability.js
│   ├── providers.js
│   ├── server.js
│   ├── service.js
│   └── validation.js
├── tests/
│   ├── integration.test.js
│   ├── smoke.js
│   └── validation.test.js
├── .dockerignore
├── .env.example
├── .gitignore
├── CONTRIBUTORS.md
├── Dockerfile
├── compose.yml
├── package.json
└── README.md
```

## Como executar localmente

### Requisitos

- Node.js 22 ou superior
- npm
- Acesso à internet para utilizar o Gemini

Clone o repositório:

```bash
git clone https://github.com/heloisacgomes/mochileiro-api.git
cd mochileiro-api
```

Instale as dependências declaradas no projeto:

```bash
npm install
```

Inicie a API:

```bash
npm start
```

Por padrão, a aplicação utiliza o provedor demo.

Acesse:

http://localhost:3000/health

Resposta esperada:

```json
{
  "status": "ok",
  "service": "mochileiro-api"
}
```

## Integração com Google Gemini

A aplicação permite utilizar o Google Gemini
para gerar respostas personalizadas.

Crie um arquivo `.env` na raiz do projeto,
utilizando `.env.example` como referência.

Exemplo de configuração:

```dotenv
PORT=3000
AI_PROVIDER=gemini
GEMINI_API_KEY=SUA_CHAVE
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_OUTPUT_TOKENS=4096
```

A chave deve ser gerada no Google AI Studio:

https://aistudio.google.com/apikey

Inicie a aplicação com as variáveis de ambiente:

```bash
node --env-file=.env src/server.js
```

O projeto utiliza integração HTTP direta com
a API Gemini, sem dependência do n8n.

O limite padrão de saída é de 4096 tokens,
com timeout de 45 segundos.

Caso a resposta atinja o limite de tokens,
a aplicação identifica a interrupção e
trata a geração como erro.

**Segurança:** nunca publique o arquivo `.env`
ou compartilhe sua chave de API.

A integração depende da disponibilidade
do modelo, conectividade e limites do provedor.

## Endpoints

### GET /health

Verifica o estado básico da aplicação.

Exemplo:

```bash
curl http://localhost:3000/health
```

### POST /api/consultas

Recebe uma pergunta relacionada a viagens
e retorna a resposta do provedor configurado.

Exemplo:

```bash
curl -X POST http://localhost:3000/api/consultas \
  -H "Content-Type: application/json" \
  -d '{
    "pergunta": "Monte um roteiro econômico de 3 dias em Paris",
    "sessionId": "viagem-01"
  }'
```

Estrutura da resposta:

```json
{
  "resposta": "Sugestões e orientações para a viagem...",
  "sessionId": "viagem-01",
  "provider": "ai"
}
```

No modo demonstrativo, o campo provider
é retornado como "demo".

O sessionId identifica a consulta, mas
não implementa persistência de conversas.

### GET /metrics

Disponibiliza métricas em formato compatível
com Prometheus.

O monitoramento inclui requisições HTTP
e medidas de latência mantidas em memória.

As métricas são reiniciadas quando o
processo da aplicação é encerrado.

## Testes automatizados

O projeto utiliza o módulo nativo node:test.

Os testes contemplam:

- Validação das entradas.
- Configuração da aplicação.
- Utilização do Strategy Pattern.
- Simulação de respostas do Gemini.
- Tratamento de erros HTTP.
- Identificação de respostas interrompidas.
- Métricas e observabilidade.
- Integração entre as camadas HTTP.

Executar testes:

```bash
npm test
```

Executar testes com cobertura mínima:

```bash
npm run test:coverage
```

Verificar sintaxe:

```bash
npm run lint
```

A meta mínima declarada é de 80% de
cobertura de linhas.

O comando de lint realiza verificação
sintática, não uma análise completa
com ESLint.

## Docker Compose

A aplicação possui Dockerfile e compose.yml
para padronização da execução em containers.

Para construir e iniciar:

```bash
docker compose up --build -d
```

Consultar o estado:

```bash
docker compose ps
```

Encerrar:

```bash
docker compose down
```

A API é disponibilizada em:

http://localhost:3000

A configuração do Compose utiliza variáveis
de ambiente para selecionar o provedor.

## Integração contínua

O projeto contém um workflow do GitHub Actions:

.github/workflows/ci.yml

A pipeline foi configurada para executar:

- Instalação de dependências.
- Verificação sintática.
- Testes automatizados.
- Verificação de cobertura mínima.
- Build da imagem Docker.

A execução da pipeline precisa ser
confirmada na aba Actions do GitHub.

## Observabilidade e SLO

A aplicação registra logs JSON no stdout,
com informações de requisição, status
e tempo de resposta.

A configuração evita registrar diretamente
o conteúdo das perguntas e a chave do Gemini.

Também disponibiliza métricas HTTP no endpoint:

GET /metrics

SLO inicial proposto:

95% das consultas no modo demonstrativo
devem ser concluídas em até 500 ms.

Esse SLO é um objetivo operacional e não
representa comprovação de disponibilidade
contínua em produção.

## Teste de desempenho

Foi realizado um smoke test local utilizando
Grafana k6 v2.4.0, com um usuário virtual
durante 30 segundos.

### Resultados

| Métrica | Resultado |
|---|---|
| Requisições HTTP | 30 |
| Verificações aprovadas | 60/60 |
| Latência média | 5,86 ms |
| Latência p95 | 3,42 ms |
| Latência máxima | 125,4 ms |
| Taxa de falhas HTTP | 0,00% |
| Threshold p95 | < 500 ms |
| Threshold de falhas | < 1% |

Os thresholds definidos foram atendidos.

O teste foi executado localmente com o
provedor demo, sem chamadas externas
ao Gemini.

Portanto, esses resultados não representam
a latência da IA nem a capacidade da
aplicação sob carga elevada.

Relatório completo:
[docs/desempenho.md](docs/desempenho.md)

## Documentação

- [Decisão arquitetural (ADR)](docs/adr/0001-decisao.md)
- [Contrato OpenAPI](docs/openapi.yaml)
- [Relatório de desempenho](docs/desempenho.md)
- [Uso de inteligência artificial](docs/ia.md)
- [Autoria](CONTRIBUTORS.md)

## Limitações e melhorias futuras

A versão atual não implementa:

- Persistência de consultas em banco de dados.
- Histórico ou memória conversacional.
- Busca de preços e voos em tempo real.
- Consulta automatizada a bases oficiais de vistos.
- Autenticação de usuários.
- Rate limiting por usuário.

Informações geradas pela IA podem estar
desatualizadas e devem ser verificadas
em fontes oficiais.

A aplicação foi desenvolvida com finalidade
educacional e não deve ser exposta
publicamente sem controles adicionais
de segurança e utilização.

## Sobre o projeto

O Mochileiro API foi desenvolvido como
projeto individual para aplicação de
conceitos de desenvolvimento backend,
arquitetura de software, integração com
IA, testes automatizados e práticas
Full Cycle.

**Desenvolvedora:** Heloísa Gomes  
**GitHub:** [@heloisacgomes](https://github.com/heloisacgomes)
