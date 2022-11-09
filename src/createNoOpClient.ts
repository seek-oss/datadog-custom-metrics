import { MetricsClient } from './MetricsClient';

/**
 * Creates a no-op Datadog client
 *
 * This is useful if your application expects a MetricsClient
 * but you'd like to avoid using one in some environments
 *
 */
export const createNoOpClient = (): MetricsClient => ({
  increment: () => {},
  decrement: () => {},
  histogram: () => {},
  timing: () => {},
});
