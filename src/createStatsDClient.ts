import AppConfig from './AppConfig';
import MetricsClient from './MetricsClient';
import globalTags from './globalTags';
import { StatsD } from './statsD';

/**
 * Configuration for building a StatsD client
 */
export interface StatsDConfig extends AppConfig {
  /**
   * Optional hostname of the metrics server
   *
   * For Gantry this is `localhost`. If this is not specified then a mock
   * client will be constructed.
   */
  metricsServer?: string;
}

/**
 * Creates a new StatsD client configured for the given app
 *
 * The returned client is configured to use a common tagging convention based
 * on the application's name, environment and version.
 *
 * @param config       - Application configuration
 * @param errorHandler - Optional error handler function
 */
export default (
  config: StatsDConfig,
  errorHandler?: (err: Error) => void,
): MetricsClient => {
  // Avoid a hard dependency on `hot-shots` for e.g. Lambda CloudWatch users
  // This severely angers TypeScript in multiple ways.

  // eslint-disable-next-line
  const StatsDClass = require('hot-shots').StatsD as typeof StatsD;

  const client = new StatsDClass({
    // Disable ourselves if there's no configured metrics server
    mock: !config.metricsServer,
    host: config.metricsServer,
    errorHandler,

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
