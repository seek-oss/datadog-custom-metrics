/**
 * Configuration for building a new metrics client
 */
export interface AppConfig {
  /**
   * Environment of the application
   *
   * @deprecated Review whether you can rely on the `env` set by your Datadog
   * agent; this will be the Automat or Gantry environment name at SEEK.
   *
   * In some scenarios, you may still want to manually set a different
   * environment here. Some Gantry services may have a Gantry environment name
   * like `prod-1` and then supply a different value like `production` here.
   * This behaviour has been retained. It results in metrics that are tagged
   * with both `env:prod-1` and `env:production`, and may be useful for forward
   * compatibility with Automat's `development` | `production`.
   */
  environment?: string;

  /**
   * Name of the application
   *
   * This is used to prefix custom metric names. It should typically be the name
   * of the component that is being instrumented and match the Datadog `service`
   * tag and/or `DD_SERVICE` environment variable.
   */
  name: string;
}
