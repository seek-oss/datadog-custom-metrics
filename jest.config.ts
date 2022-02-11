import { Jest } from 'skuba';

export default Jest.mergePreset({
  coverageThreshold: {
    global: {
      branches: 100,
      lines: 100,
      functions: 100,
    },
  },
});
