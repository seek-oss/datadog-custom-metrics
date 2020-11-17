import { StatsD } from 'hot-shots';

import createStatsDClient from './createStatsDClient';

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
});
