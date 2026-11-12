

export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT inválida');
  }

  const provider = env.AI_PROVIDER ?? 'demo';

  if (!['demo', 'gemini'].includes(provider)) {
    throw new Error('AI_PROVIDER deve ser demo ou gemini');
  }

  if (provider === 'gemini' && !env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY é obrigatória para gemini');
  }

  const maxOutputTokens = Number(
    env.GEMINI_MAX_OUTPUT_TOKENS ?? 4096
  );

  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 128 ||
    maxOutputTokens > 8192
  ) {
    throw new Error(
      'GEMINI_MAX_OUTPUT_TOKENS deve estar entre 128 e 8192'
    );
  }

  return {
    port,
    provider,
    geminiApiKey: env.GEMINI_API_KEY ?? '',
    geminiModel: env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    timeoutMs: 45000,
    maxOutputTokens,
    maxBodyBytes: 8192
  };
}
