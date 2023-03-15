/**
 * Abstract interface for recording metrics for AWS Lambda
 */
export interface LambdaExtensionMetricsClient {
  /**
   * Records a time in milliseconds
   *
   * @param name  - Name of the metric to record.
   * @param value - Time in milliseconds. Fractional values are supported.
   * @param tags  - Optional list of tags for the metric.
   */
  timing(name: string, value: number, tags?: string[]): void;

  /**
   * Measures the statistical distribution of a set of values
   *
   * @param name  - Name of the metric to record.
   * @param value - Value to include in the statistical distribution.
   * @param tags  - Optional list of tags for the metric.
   */
  distribution(name: string, value: number, tags?: string[]): void;

  /**
   * Increments a counter by one
   *
   * @param name  - Name of the metric to increment.
   * @param tags  - Optional list of tags for the metric.
   */
  increment(name: string, tags?: string[]): void;

  /**
   * Increments a counter by the specified integer count
   *
   * @param name  - Name of the metric to increment.
   * @param count - Number to increment the counter by.
   * @param tags  - Optional list of tags for the metric.
   */
  increment(name: string, count: number, tags?: string[]): void;
}
