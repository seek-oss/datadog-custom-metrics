import type { MetricsClient } from './MetricsClient.js';

/**
 * Creates a no-op Datadog client
 *
 * This is useful if your application expects a MetricsClient
 * but you'd like to avoid using one in some environments
 *
 */
export const createNoOpClient = (): MetricsClient => ({
  increment: () => undefined,
  decrement: () => undefined,
  histogram: () => undefined,
  timing: () => undefined,
});
