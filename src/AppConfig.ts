/**
 * Configuration for building a new metrics client
 */
export interface AppConfig {
  /**
   * Name of the application
   *
   * This is used to prefix custom metric names. It should typically be the name
   * of the component that is being instrumented and match the Datadog `service`
   * tag and/or `DD_SERVICE` environment variable.
   */
  name: string;
}
