import type { Context } from 'aws-lambda';

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
  /**
   * Conditionally wraps your AWS lambda handler function based on the provided config.
   *
   * This is necessary for initialising metrics/tracing support.
   */
  // This also "fixes" its broken type definitions.
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
  const { datadog, sendDistributionMetric } =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('datadog-lambda-js') as typeof import('datadog-lambda-js');

  const send = (metric: DatadogMetric) => {
    const { value } = metric;

    const sanitisedLambdaName = config.name.replace(new RegExp('-', 'g'), '_');
    const name = `${sanitisedLambdaName}.${metric.name.toLowerCase()}`;

    const tags = (metric.tags || []).map(sanitiseTag);

    if (config.metrics) {
      sendDistributionMetric(name, value, ...tags);
    }
  };

  const sendCount = (
    name: string,
    countOrTags?: number | string[],
    tagsIfCount?: string[],
  ): void => {
    let count: number;
    let tags: string[] | undefined;

    if (typeof countOrTags === 'number') {
      count = countOrTags;
      tags = tagsIfCount;
    } else {
      count = 1;
      tags = countOrTags;
    }

    send({ name, tags, value: count });
  };

  return {
    withLambdaExtension: <Event, Output = unknown>(
      fn: Handler<Event, Output>,
    ): Handler<Event, Output> =>
      config.metrics ? (datadog(fn) as Handler<Event, Output>) : fn,

    metricsClient: {
      increment: sendCount,

      distribution: (name: string, value: number, tags?: string[]): void => {
        send({ name, tags, value });
      },

      timing: (name: string, value: number, tags?: string[]): void => {
        send({ name, tags, value });
      },
    },
  };
};
