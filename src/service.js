export class TravelService {
  constructor(provider) { this.provider = provider; }
  async consultar({ pergunta, sessionId }) {
    const resposta = await this.provider.gerarResposta(pergunta);
    return { resposta, ...(sessionId ? { sessionId } : {}), provider: this.provider.constructor.name === 'DemoTravelProvider' ? 'demo' : 'ai' };
  }
}
