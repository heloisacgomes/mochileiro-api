export class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; }
}

export function validateConsulta(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('Envie um objeto JSON');
  const { pergunta, sessionId } = value;
  if (typeof pergunta !== 'string' || pergunta.trim().length < 10 || pergunta.trim().length > 1000) {
    throw new ValidationError('pergunta deve conter entre 10 e 1000 caracteres');
  }
  if (sessionId !== undefined && (typeof sessionId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(sessionId))) {
    throw new ValidationError('sessionId deve ter de 1 a 64 letras, números, _ ou -');
  }
  return { pergunta: pergunta.trim(), ...(sessionId === undefined ? {} : { sessionId }) };
}
