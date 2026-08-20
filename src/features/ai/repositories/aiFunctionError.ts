export async function readableFunctionError(error: unknown, fallback: string): Promise<Error> {
  const context = error && typeof error === 'object' && 'context' in error
    ? (error as { context?: unknown }).context
    : undefined;

  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { error?: string; message?: string };
      const message = payload.error ?? payload.message;
      if (message) return new Error(message);
    } catch {
      // Provider returned non-JSON; keep fallback below.
    }
  }

  const message = error instanceof Error ? error.message : '';
  if (message.includes('non-2xx') || message.includes('FunctionsHttpError')) return new Error(fallback);
  return new Error(message || fallback);
}

export function configuredServiceError(feature: 'AI' | 'Speech'): string {
  return `${feature} service chưa được cấu hình trên Cloud. Anh cần thêm credential server rồi thử lại.`;
}

