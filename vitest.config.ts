import { Vitest } from 'skuba';
import { defineConfig } from 'vitest/config';

export default defineConfig(
  Vitest.mergePreset({
    ssr: {
      resolve: {
        conditions: ['@seek/datadog-custom-metrics/source'],
      },
    },
    test: {
      env: {
        ENVIRONMENT: 'test',
      },
      coverage: {
        provider: 'istanbul',
        exclude: ['src/testing'],
        thresholds: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
  }),
);
