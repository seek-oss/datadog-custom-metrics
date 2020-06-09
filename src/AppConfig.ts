/**
 * Configuration for building a new metrics client
 */
export default interface AppConfig {
  /**
   * Name of the application
   *
   * This is used to prefix custom metric names. It will typically be the name
   * of the app's GitHub repository.
   */
  name: string;

  /**
   * Version of the application
   *
   * This is used to tag custom metrics. It will typically be a CI build
   * number.
   */
  version?: string;

  /**
   * Environment of the application
   *
   * This is used to tag custom metrics. Typical examples are `prod` and `dev`.
   */
  environment: string;
}
