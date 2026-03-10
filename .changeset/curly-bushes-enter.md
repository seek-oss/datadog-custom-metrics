---
'seek-datadog-custom-metrics': major
---

Migrate `createLambdaExtensionClient` and `LambdaExtensionMetricsClient` to the new `lambda` entry point.

```diff
- import { createLambdaExtensionClient, type LambdaExtensionMetricsClient } from 'seek-datadog-custom-metrics';
+ import { createLambdaExtensionClient, type LambdaExtensionMetricsClient } from 'seek-datadog-custom-metrics/lambda';
```

This should resolve the following runtime issue for Lambda functions when esbuild is used:

```bash
 "TypeError [ERR_INVALID_ARG_VALUE]: The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received undefined",
        "    at createRequire (node:internal/modules/cjs/loader:1967:11)",
        "    at Object.<anonymous> (/node_modules/.pnpm/seek-datadog-custom-metrics@7.0.0_datadog-lambda-js@12.132.0_hot-shots@13.1.0/node_modules/seek-datadog-custom-metrics/lib/_virtual/_rolldown/runtime.mjs:4:33)",
```

Your component must install the `datadog-lambda-js` peer dependency to use this entry point.
