import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
const deadline = new AsyncLocalStorage<AbortSignal>();
export function withinGenerationDeadline<T>(work: () => Promise<T>) {
  return deadline.run(AbortSignal.timeout(250_000), work);
}
export function providerFetch(input: string | URL | Request, options: RequestInit = {}) {
  const signals = [AbortSignal.timeout(90_000), deadline.getStore(), options.signal].filter(Boolean) as AbortSignal[];
  return fetch(input, { ...options, signal: AbortSignal.any(signals) });
}
