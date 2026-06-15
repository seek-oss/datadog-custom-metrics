// This file was migrated from Jest to Vitest in vitest.config.ts by skuba. Please verify the migration was successful and delete this file.

import { Jest } from 'skuba';

export default Jest.mergePreset({
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
});
