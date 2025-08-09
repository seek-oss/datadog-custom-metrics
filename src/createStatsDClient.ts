import type { AppConfig } from './AppConfig.js';
import type { MetricsClient } from './MetricsClient.js';
import { globalTags } from './globalTags.js';

interface InternalStatsD extends MetricsClient {
  socket?: {
    close(callback?: () => void): void;
  };
}

type StatsD<T extends InternalStatsD> = new (options?: {
  mock?: boolean;
  host?: string;
  errorHandler?: (err: Error) => void;
  includeDataDogTags?: boolean;
  prefix?: string;
  globalTags?: Record<string, string> | string[];
}) => T;

/**
 * Configuration for building a StatsD client
 */
export interface StatsDConfig extends AppConfig {
  /**
   * Whether to read `DD_ENV`, `DD_SERVICE`, `DD_VERSION` environment variables
   * to populate global `env`, `service`, `version` tags.
   *
   * If this is set to `true`, `DD_ENV` will override the value provided in the
   * `environment` config option.
   *
   * For Gantry this should be set to `false`, as unified service tags are
   * automatically propagated to the Datadog agent sidecar during deployment.
   *
   * Defaults to `false`.
   */
  includeDataDogTags?: boolean;

  /**
   * Optional hostname of the metrics server
   *
   * For Gantry this is `localhost`. If this is not specified then a mock
   * client will be constructed.
   */
  metricsServer?: string | null | undefined;
}

/**
 * Creates a new StatsD client configured for the given app
 *
 * The returned client is configured to use a common tagging convention based
 * on the application's name, environment and version.
 *
 * @param StatsD       - StatsD class from `hot-shots`
 * @param config       - Application configuration
 * @param errorHandler - Optional error handler function
 */
export const createStatsDClient = <T extends InternalStatsD>(
  StatsD: StatsD<T>,
  config: StatsDConfig,
  errorHandler?: (err: Error) => void,
): T => {
  // istanbul ignore next: Jest is not picking up coalesce coverage
  const host = config.metricsServer ?? undefined;

  const client = new StatsD({
    // Disable ourselves if there's no configured metrics server
    mock: !config.metricsServer,
    host,
    errorHandler,
    includeDataDogTags: config.includeDataDogTags ?? false,

    prefix: `${config.name}.`,
    globalTags: globalTags(config),
  });

  // istanbul ignore next else
  if (!config.metricsServer && client.socket) {
    // hot-shots will open a UDP socket even in mock mode which causes us to leak handles on Jest.
    // Kill its useless socket behind its back.
    client.socket.close();
  }

  return client;
};
