import MetricsClient from './MetricsClient';

/**
 * Sends timing related metrics for an asynchronous operation
 *
 * This sends two metrics:
 * 1. `${name}.latency` is a timing metric containing the operation latency
 * 2. `${name}.count` is a count metric with a `success` or `failure` tag
 *
 * @param metricsClient - Metrics client to custom metrics to
 * @param name          - Name of the custom metric
 * @param block         - Function returning the promise to time
 */
export default (metricsClient: MetricsClient) => async <T>(
  name: string,
  block: () => PromiseLike<T>,
): Promise<T> => {
  const startTime = process.hrtime.bigint();

  const handleCompletion = (success: boolean) => {
    const durationNanos = process.hrtime.bigint() - startTime;
    const successTag = success ? 'success' : 'failure';

    metricsClient.timing(`${name}.latency`, Number(durationNanos) / 1e6);
    metricsClient.increment(`${name}.count`, [successTag]);
  };

  try {
    const result = await block();
    handleCompletion(true);
    return result;
  } catch (e) {
    handleCompletion(false);
    throw e;
  }
};
