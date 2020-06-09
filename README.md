# 🐶 node-datadog-custom-metrics

[![Slack Channel](https://img.shields.io/badge/slack-%23indirect--apply-aa6dca.svg?style=flat-square)](https://seekchat.slack.com/messages/indirect-apply/)
[![Build status](https://badge.buildkite.com/0e1adc2fa4366020ed5e5cf2032c7db533ad0ccb008c6dd663.svg?branch=master)](https://buildkite.com/seek/node-datadog-custom-metrics)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

Helpers for sending [Datadog custom metrics](https://docs.datadoghq.com/developers/metrics/custom_metrics/) from Node.js.

For containerized services this depends on [hot-shots](https://github.com/brightcove/hot-shots).
For Lambda this uses [Datadog's CloudWatch integration](https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs).

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
import { createStatsDClient } from '@seek/node-datadog-custom-metrics';

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
import { createCloudWatchClient } from '@seek/node-datadog-custom-metrics';

// Expects `name`, `version` and `environment` properties
import config from '../config';

// Returns a `MetricsClient` subset of the full StatsD interface
const metricsClient = createCloudWatchClient(config);
```

### `createTimedSpan`

`createTimedSpan` wraps an asynchronous closure and records custom Datadog metrics about its performance.
This is intended as a lightweight alternative to [APM](https://www.datadoghq.com/apm/) where nested spans aren't required.

```typescript
import { createTimedSpan } from '@seek/node-datadog-custom-metrics';

// Takes a StatsD instance or `MetricsClient`
const timedSpan = createTimedSpan(metricsClient);

const loadPrivateKey = async (): Promise<PrivateKey> =>
  await timedSpan(
    // Prefix for the custom metrics
    'secrets.load_private_key',
    // Closure to be timed
    () => client.getSecretValue({ SecretId }).promise()
  );
```
