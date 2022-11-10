import { AppConfig } from './AppConfig';
import { MetricsClient } from './MetricsClient';
import { globalTags } from './globalTags';

interface DatadogMetric {
  name: string;
  tags?: string[];
  type: 'count' | 'histogram';
  value: number;
}

/**
 * Replaces tag special characters with an underscore
 */
const sanitiseTag = (tag: string): string => tag.replace(/\||@|,/g, '_');

/**
 * Creates a new CloudWatch Datadog client configured for the given app
 *
 * @deprecated This depends on Datadog's deprecated CloudWatch log integration.
 * This has been superseded by the Datadog Lambda Extension which does not
 * support the `count` metric type required by our `MetricClient` interface.
 *
 * @see {@link https://docs.datadoghq.com/serverless/libraries_integrations/extension/}
 * @see {@link https://docs.datadoghq.com/serverless/custom_metrics/#deprecated-cloudwatch-logs}
 *
 * @param config - Application configuration
 */
export const createCloudWatchClient = (config: AppConfig): MetricsClient => {
  const send = (metric: DatadogMetric) => {
    const { type, value } = metric;

    const name = `${config.name}.${metric.name.toLowerCase()}`;

    const tags = [...globalTags(config), ...(metric.tags || [])]
      .map(sanitiseTag)
      .join(',');

    const timestamp = Date.now();

    process.stdout.write(
      `MONITORING|${timestamp}|${value}|${type}|${name}|#${tags}\n`,
    );
  };

  // This is used to implement `increment` and `decrement`
  // `countToValue` is a hook to allow `decrement` to flip the sign of the count
  const sendCount =
    (countToValue: (value: number) => number) =>
    (
      name: string,
      countOrTags?: number | string[],
      tagsIfCount?: string[],
    ): void => {
      let count: number;
      let tags: string[] | undefined;

      // Emulate overloading from StatsD's interface
      if (typeof countOrTags === 'number') {
        count = countOrTags;
        tags = tagsIfCount;
      } else {
        count = 1;
        tags = countOrTags;
      }

      send({ name, tags, type: 'count', value: countToValue(count) });
    };

  return {
    increment: sendCount((count) => count),
    decrement: sendCount((count) => -count),

    histogram: (name: string, value: number, tags?: string[]): void => {
      send({ name, tags, type: 'histogram', value });
    },

    // The CloudWatch integration treats this as a histogram of milliseconds
    timing: (name: string, value: number, tags?: string[]): void => {
      send({ name, tags, type: 'histogram', value });
    },
  };
};
