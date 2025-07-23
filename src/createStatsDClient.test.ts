import { StatsD } from 'hot-shots';

import { createStatsDClient } from './createStatsDClient.js';

describe('createStatsDClient', () => {
  it('should create a new mock client', () => {
    expect(
      createStatsDClient(StatsD, {
        name: 'test',
        environment: 'deprecated-but-still-here',
      }),
    ).toBeInstanceOf(Object);
  });

  it('should handle null config values', () => {
    expect(
      createStatsDClient(StatsD, {
        name: 'test',
        metricsServer: null,
      }),
    ).toBeInstanceOf(Object);
  });
});
