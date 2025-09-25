# 🐶 Datadog Custom Metrics

[![GitHub Release](https://github.com/seek-oss/datadog-custom-metrics/workflows/Release/badge.svg?branch=master)](https://github.com/seek-oss/datadog-custom-metrics/actions?query=workflow%3ARelease)
[![GitHub Validate](https://github.com/seek-oss/datadog-custom-metrics/workflows/Validate/badge.svg?branch=master)](https://github.com/seek-oss/datadog-custom-metrics/actions?query=workflow%3AValidate)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D%2010-brightgreen)](https://nodejs.org/en/)
[![npm package](https://img.shields.io/npm/v/seek-datadog-custom-metrics)](https://www.npmjs.com/package/seek-datadog-custom-metrics)
[![Powered by skuba](https://img.shields.io/badge/🤿%20skuba-powered-009DC4)](https://github.com/seek-oss/skuba)

Helpers for sending [Datadog custom metrics](https://docs.datadoghq.com/developers/metrics/custom_metrics/) via [hot-shots](https://github.com/brightcove/hot-shots).

```shell
pnpm add seek-datadog-custom-metrics
```

## Tagging convention

All custom metrics are prefixed by `{config.name}.`.

One global tag may be optionally added to every custom metric:

- `AppConfig.environment` becomes `env:${value}`

  `DD_ENV` becomes `env:${value}`

  This behaviour has been retained for compatibility.
  Review whether you can rely on the `env` set by your Datadog agent;
  this will be the Automat or Gantry environment name at SEEK.

  In some scenarios, you may still want to manually set a different environment.
  Some Gantry services may have a Gantry environment name like `prod-1` and then supply a different value like `production` via `environment` config or the `DD_ENV` environment variable.
  This behaviour has been retained.
  It results in metrics with multiple env tags, e.g. `env:prod,env:production,env:prod-1`,
  and may be useful for backward compatibility with existing dashboards and monitors,
  and forward compatibility with Automat's `development` | `production`.

## API reference

### `createStatsDClient`

`createStatsDClient` creates a [hot-shots](https://github.com/brightcove/hot-shots) client.
This is intended for containerized services, particularly those deployed with [Gantry](https://github.com/SEEK-Jobs/gantry).

```typescript
import { StatsD } from 'hot-shots';
import { createStatsDClient } from 'seek-datadog-custom-metrics';

// Expects `name` and `metricsServer` properties
import config from '../config';

// This example assumes Bunyan/pino
import { rootLogger } from '../logger';
const errorHandler = (err: Error) => {
  rootLogger.error('StatsD error', err);
};

// Returns a standard hot-shots StatsD instance
const metricsClient = createStatsDClient(StatsD, config, errorHandler);
```

### `createLambdaExtensionClient`

`createLambdaExtensionClient` creates a [Lambda extension](https://docs.datadoghq.com/serverless/libraries_integrations/extension/) client.
This is intended for AWS Lambda functions and is a replacement for `createCloudWatchClient`.

This client will only submit metrics as a [distribution](https://docs.datadoghq.com/metrics/distributions/) which enables globally accurate aggregations for percentiles (p50, p75, p90, etc).

```typescript
import { createLambdaExtensionClient } from 'seek-datadog-custom-metrics';

// Expects `name` and `metrics` properties
import config from '../config';

// Returns a standard hot-shots StatsD instance
const { metricsClient, withLambdaExtension } =
  createLambdaExtensionClient(config);

export const handler = withLambdaExtension((event, _ctx) => {
  try {
    logger.info('request');

    await lambdaFunction(event);
  } catch (err) {
    logger.error({ err }, 'request');

    metricsClient.increment('invocation_error');

    throw new Error('invoke error');
  }
});
```

### `createNoOpClient`

`createNoOpClient` returns a no-op client.
This is intended for use where a MetricsClient interface is expected but you do not wish to provide one, e.g in tests.

```typescript
import { createNoOpClient } from 'seek-datadog-custom-metrics';

// Returns a `MetricsClient` subset of the full StatsD interface
const metricsClient = createNoOpClient();
```

### `createTimedSpan`

`createTimedSpan` wraps an asynchronous closure and records custom Datadog metrics about its performance.
This is intended as a lightweight alternative to [APM](https://www.datadoghq.com/apm/) where nested spans aren't required.

```typescript
import { createTimedSpan } from 'seek-datadog-custom-metrics';

// Takes a StatsD instance or `MetricsClient`
const timedSpan = createTimedSpan(metricsClient);

const loadPrivateKey = async (): Promise<PrivateKey> =>
  await timedSpan(
    // Prefix for the custom metrics
    'secrets.load_private_key',
    // Closure to be timed
    () => client.getSecretValue({ SecretId }).promise(),
  );
```

### `httpTracingConfig`

The [dd-trace] package can instrument your application and trace its outbound HTTP requests.
However, its emitted `trace.http.request` metric only captures the HTTP method against the `resource.name` tag,
which is not useful if your application makes HTTP requests to multiple resources and you want to inspect latency by resource.

This configuration object adds a hook to replace the `resource.name` with a HTTP method and semi-normalised URL.
For example, if your application makes the following HTTP request:

```http
PUT https://www.example.com/path/to/123?idempotencyKey=c1083fb6-519c-42bf-8619-08dfd6229954
```

The `trace.http.request` metric will see the following tag change:

```diff
- resource_name:put
+ resource_name:put_https://www.example.com/path/to/number?idempotencyKey=uuid
```

Apply the configuration object where you bootstrap your application with the Datadog tracer:

```typescript
import { httpTracingConfig } from 'seek-datadog-custom-metrics';

// DataDog/dd-trace-js#1118
datadogTracer?.use('http', httpTracingConfig);
```

This configuration may be superseded in future if the underlying [dd-trace] implementation is corrected.

[DataDog/dd-trace-js#1118](https://github.com/DataDog/dd-trace-js/issues/1118)

[dd-trace]: https://github.com/DataDog/dd-trace-js
