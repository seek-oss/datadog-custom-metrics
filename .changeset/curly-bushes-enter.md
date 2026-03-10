---
'seek-datadog-custom-metrics': major
---

Migrate `createLambdaExtensionClient` and `LambdaExtensionMetricsClient` to the new `lambda` entry point.

```diff
- import { createLambdaExtensionClient, type LambdaExtensionMetricsClient } from 'seek-datadog-custom-metrics';
+ import { createLambdaExtensionClient, type LambdaExtensionMetricsClient } from 'seek-datadog-custom-metrics/lambda';
```

Your component must install the `datadog-lambda-js` peer dependency to use this entry point.
