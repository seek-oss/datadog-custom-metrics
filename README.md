# 🐶 Datadog Custom Metrics

Helpers for sending [Datadog custom metrics](https://docs.datadoghq.com/developers/metrics/custom_metrics/) from Node.js.

For containerized services this depends on [hot-shots](https://github.com/brightcove/hot-shots).
For Lambda this uses [Datadog's CloudWatch integration](https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs).

```shell
yarn add seek-datadog-custom-metrics
```

## Tagging Convention

All custom metrics are prefixed by `AppConfig.name`.
Two global tags are also added to every custom metric:

- `AppConfig.environment` becomes `env:${value}`
- `AppConfig.version` becomes `version:${value}`

These tags are consistent with tags sent by [Gantry](https://github.com/SEEK-Jobs/gantry) via Datadog's AWS integration.

## Usage

### `createStatsDClient`

`createStatsDClient` creates a [hot-shots](https://github.com/brightcove/hot-shots) client configured with our [tagging convention](#tagging-convention).
This is intended for containerized services, particularly those deployed with [Gantry](https://github.com/SEEK-Jobs/gantry).

```typescript
import { createStatsDClient } from 'seek-datadog-custom-metrics';

// Expects `name`, `version`, `environment` and `metricsServer` properties
import config from '../config';

// This example assumes Bunyan/pino
import { rootLogger } from '../logger';
const errorHandler = (err: Error) => {
  rootLogger.error('StatsD error', err);
};

// Returns a standard hot-shots StatsD instance
const metricsClient = createStatsDClient(config, errorHandler);
```

### `createCloudWatchClient`

`createCloudWatchClient` returns a client that uses [Datadog's CloudWatch integration](https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs).
This is intended for use in Lambda functions.

```typescript
import { createCloudWatchClient } from 'seek-datadog-custom-metrics';

// Expects `name`, `version` and `environment` properties
import config from '../config';

// Returns a `MetricsClient` subset of the full StatsD interface
const metricsClient = createCloudWatchClient(config);
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
