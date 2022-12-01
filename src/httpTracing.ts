interface HttpRequest {
  host?: string;
  method?: string;
  path?: string;
  protocol?: string;
  url?: string;
}

interface OpenTracingSpan {
  setTag: (key: string, value: unknown) => unknown;
}

export const inferResourceName = (
  req: HttpRequest | undefined,
): string | undefined => {
  if (!req?.method) {
    return;
  }

  const url =
    req.url ??
    (req.protocol && req.host && req.path
      ? `${req.protocol}//${req.host}${req.path}`
      : undefined);

  if (!url) {
    return;
  }

  const route = url
    .replace(
      /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/gi,
      'uuid',
    )
    .replace(/\d+/g, 'number');

  return `${req.method} ${route}`;
};

export const request = (
  span?: OpenTracingSpan | undefined,
  req?: HttpRequest | undefined,
): void => {
  if (!span) {
    return;
  }

  const resourceName = inferResourceName(req);

  if (resourceName) {
    span.setTag('resource.name', resourceName);
  }
};

/**
 * The [dd-trace] package can instrument your application and trace its outbound HTTP requests.
 * However, its emitted `trace.http.request` metric only captures the HTTP method against the `resource.name` tag,
 * which is not useful if your application makes HTTP requests to multiple resources and you want to inspect latency by resource.
 *
 * This configuration object adds a hook to replace the `resource.name` with a HTTP method and semi-normalised URL.
 * For example, if your application makes the following HTTP request:
 *
 * ```http
 * PUT https://www.example.com/path/to/123?idempotencyKey=c1083fb6-519c-42bf-8619-08dfd6229954
 * ```
 *
 * The `trace.http.request` metric will see the following tag change:
 *
 * ```diff
 * - resource_name:put
 * + resource_name:put_https://www.example.com/path/to/number?idempotencyKey=uuid
 * ```
 *
 * Apply the configuration object where you bootstrap your application with the Datadog tracer:
 *
 * ```typescript
 * import { httpTracingConfig } from 'seek-datadog-custom-metrics';
 *
 * // DataDog/dd-trace-js#1118
 * datadogTracer?.use('http', httpTracingConfig);
 * ```
 *
 * This configuration may be superseded in future if the underlying [dd-trace] implementation is corrected.
 *
 * [DataDog/dd-trace-js#1118](https://github.com/DataDog/dd-trace-js/issues/1118)
 *
 * [dd-trace]: https://github.com/DataDog/dd-trace-js
 */
export const httpTracingConfig = {
  hooks: {
    request,
  },
};
