# 🐶 Datadog Custom Metrics

[![GitHub Release](https://github.com/seek-oss/datadog-custom-metrics/workflows/Release/badge.svg?branch=master)](https://github.com/seek-oss/datadog-custom-metrics/actions?query=workflow%3ARelease)
[![GitHub Validate](https://github.com/seek-oss/datadog-custom-metrics/workflows/Validate/badge.svg?branch=master)](https://github.com/seek-oss/datadog-custom-metrics/actions?query=workflow%3AValidate)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D%2010-brightgreen)](https://nodejs.org/en/)
[![npm package](https://img.shields.io/npm/v/seek-datadog-custom-metrics)](https://www.npmjs.com/package/seek-datadog-custom-metrics)
[![Powered by skuba](https://img.shields.io/badge/🤿%20skuba-powered-009DC4)](https://github.com/seek-oss/skuba)

Common interface for sending [Datadog custom metrics](https://docs.datadoghq.com/developers/metrics/custom_metrics/) from Node.js runtime environments:

- Containers (via [hot-shots](https://github.com/brightcove/hot-shots))
- AWS Lambda (via [Datadog's CloudWatch integration](https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs))

```shell
yarn add seek-datadog-custom-metrics
```

## Table of contents

- [Tagging convention](#tagging-convention)
- [API reference](#api-reference)
  - [createStatsDClient](#createstatsdclient)
  - [createCloudWatchClient](#createcloudwatchclient)
  - [createNoOpClient](#createnoopclient)
  - [createTimedSpan](#createtimedspan)
- [Contributing](https://github.com/seek-oss/datadog-custom-metrics/blob/master/CONTRIBUTING.md)

## Tagging convention

All custom metrics are prefixed by `AppConfig.name`.
Two global tags are also added to every custom metric:

- `AppConfig.environment` becomes `env:${value}`
- `AppConfig.version` becomes `version:${value}`

These tags are consistent with tags sent by [Gantry](https://github.com/SEEK-Jobs/gantry) via Datadog's AWS integration.

## API reference

### `createStatsDClient`

`createStatsDClient` creates a [hot-shots](https://github.com/brightcove/hot-shots) client configured with our [tagging convention](#tagging-convention).
This is intended for containerized services, particularly those deployed with [Gantry](https://github.com/SEEK-Jobs/gantry).

```typescript
import { StatsD } from 'hot-shots';
import { createStatsDClient } from 'seek-datadog-custom-metrics';

// Expects `name`, `version`, `environment` and `metricsServer` properties
import config from '../config';

// This example assumes Bunyan/pino
import { rootLogger } from '../logger';
const errorHandler = (err: Error) => {
  rootLogger.error('StatsD error', err);
};

// Returns a standard hot-shots StatsD instance
const metricsClient = createStatsDClient(StatsD, config, errorHandler);
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
