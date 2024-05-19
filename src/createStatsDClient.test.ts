import { StatsD } from 'hot-shots';

import { createStatsDClient } from './createStatsDClient';

describe('createStatsDClient', () => {
  it('should create a new mock client', () => {
    expect(
      createStatsDClient(StatsD, {
        name: 'test',
        environment: 'jest',
        version: '0',
      }),
    ).toBeInstanceOf(Object);
  });

  it('should handle null config values', () => {
    expect(
      createStatsDClient(StatsD, {
        name: 'test',
        environment: 'jest',
        version: null,

        metricsServer: null,
      }),
    ).toBeInstanceOf(Object);
  });
});
