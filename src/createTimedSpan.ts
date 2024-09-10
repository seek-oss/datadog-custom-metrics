import type { MetricsClient } from './MetricsClient';

type TimingMetricsClient = Pick<MetricsClient, 'increment' | 'timing'>;

interface AfterCompletion {
  tags: string[];
}

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
export const createTimedSpan =
  (metricsClient: TimingMetricsClient) =>
  async <T>(
    name: string,
    block: () => PromiseLike<T>,
    afterCompletion?: (
      duration: number,
      success: boolean,
      result: T | undefined,
    ) => AfterCompletion | void,
    tags?: string[],
  ): Promise<T> => {
    const startTime = process.hrtime.bigint();

    const handleCompletion = (success: boolean, result: T | undefined) => {
      const durationNanos = process.hrtime.bigint() - startTime;
      const successTag = success ? 'success' : 'failure';
      const durationMilliseconds = Number(durationNanos) / 1e6;

      const complete = afterCompletion?.(durationMilliseconds, success, result);

      const tagsToAdd =
        (tags ?? complete?.tags)
          ? [...(tags ?? []), ...(complete?.tags ?? [])]
          : undefined;

      metricsClient.timing(`${name}.latency`, durationMilliseconds, tagsToAdd);
      metricsClient.increment(`${name}.count`, [
        successTag,
        ...(tagsToAdd ?? []),
      ]);
    };

    try {
      const result = await block();
      handleCompletion(true, result);
      return result;
    } catch (e) {
      handleCompletion(false, undefined);
      throw e;
    }
  };
