
 // Strategy Pattern: o domínio depende de gerarResposta(), não de um SDK específico.
export class DemoTravelProvider {
  async gerarResposta(pergunta) {
    return `Mochileiro (demonstração): para sua pergunta “${pergunta}”, comece definindo orçamento, datas e preferências. Confira documentos e preços em fontes oficiais. Ative AI_PROVIDER=gemini para sugestões personalizadas.`;
  }
}

export class GeminiTravelProvider {
  
constructor({
  apiKey,
  model,
  timeoutMs = 45000,
  maxOutputTokens = 4096,
  fetchImpl = fetch
}) {
  this.apiKey = apiKey;
  this.model = model;
  this.timeoutMs = timeoutMs;
  this.maxOutputTokens = maxOutputTokens;
  this.fetchImpl = fetchImpl;
}

  async gerarResposta(pergunta) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: 'Você é o Mochileiro, assistente de viagens. Responda em português de modo prático. Não invente tarifas, regras de visto ou disponibilidade em tempo real; oriente a confirmar fontes oficiais. Não peça dados sensíveis.'
              }]
            },
            contents: [{
              role: 'user',
              parts: [{ text: pergunta }]
            }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: this.maxOutputTokens
            }
          }),
          signal: controller.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Serviço de IA respondeu HTTP ${response.status}`);
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      if (candidate?.finishReason === 'MAX_TOKENS') {
         throw new Error('A resposta do Gemini atingiu o limite de tokens');
        }

      const text = candidate?.content?.parts
        ?.map(part => part.text ?? '')
        .join('')
        .trim();

      if (!text) {
        throw new Error('Serviço de IA retornou resposta vazia');
      }

      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createTravelProvider(config) {
  return config.provider === 'gemini'
    ? new GeminiTravelProvider({
        apiKey: config.geminiApiKey,
        model: config.geminiModel,
        timeoutMs: config.timeoutMs,
        maxOutputTokens: config.maxOutputTokens
      })
    : new DemoTravelProvider();
}
