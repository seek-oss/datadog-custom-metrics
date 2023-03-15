import type { Context } from 'aws-lambda';
import { datadog, sendDistributionMetric } from 'datadog-lambda-js';

import { LambdaExtensionMetricsClient } from './LambdaExtensionMetricsClient';

interface DatadogMetric {
  name: string;
  tags?: string[];
  value: number;
}

interface DatadogConfig {
  name: string;
  metrics: boolean;
}

type Handler<Event, Output> = (
  event: Event,
  ctx: Readonly<Context>,
) => Promise<Output>;

interface LambdaExtensionClient {
  metricsClient: LambdaExtensionMetricsClient;
  withLambdaExtension: <Event, Output = unknown>(
    fn: Handler<Event, Output>,
  ) => Handler<Event, Output>;
}

/**
 * Replaces tag special characters with an underscore
 */
const sanitiseTag = (tag: string): string => tag.replace(/\||@|,/g, '_');

/**
 * Creates a new Datadog Lambda client configured for the given app.
 *
 * @see {@link https://docs.datadoghq.com/serverless/libraries_integrations/extension/}
 *
 * @param config - Application configuration
 */
export const createLambdaExtensionClient = (
  config: DatadogConfig,
): LambdaExtensionClient => {
  const send = (metric: DatadogMetric) => {
    const { value } = metric;

    const sanitisedLambdaName = config.name.replace(new RegExp('-', 'g'), '_');
    const name = `${sanitisedLambdaName}.${metric.name.toLowerCase()}`;

    const tags = (metric.tags || []).map(sanitiseTag);

    if (config.metrics) {
      sendDistributionMetric(name, value, ...tags);
    }
  };

  // This is used to implement `increment` and `decrement`
  // `countToValue` is a hook to allow `decrement` to flip the sign of the count

  // @TODO: Do we need `decrement`? We don't actually use it in Indirect at least.
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

      send({ name, tags, value: countToValue(count) });
    };

  return {
    /**
     * TODO: Provide an description.
     *
     * Conditionally applies the Datadog wrapper to a Lambda handler.
     *
     * This also "fixes" its broken type definitions.
     */
    withLambdaExtension: <Event, Output = unknown>(
      fn: Handler<Event, Output>,
    ): Handler<Event, Output> =>
      config.metrics ? (datadog(fn) as Handler<Event, Output>) : fn,

    metricsClient: {
      increment: sendCount((count) => count),
      decrement: sendCount((count) => -count),

      distribution: (name: string, value: number, tags?: string[]): void => {
        send({ name, tags, value });
      },

      timing: (name: string, value: number, tags?: string[]): void => {
        send({ name, tags, value });
      },
    },
  };
};
