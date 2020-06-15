import MetricsClient from './MetricsClient';

/**
 * Creates a no-op Datadog client
 *
 * This is useful if your application expects a MetricsClient
 * but you'd like to disable std out in some environments
 *
 */
export default (): MetricsClient => ({
  increment: () => {},
  decrement: () => {},
  histogram: () => {},
  timing: () => {},
});