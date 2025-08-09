import { StatsD } from 'hot-shots';

import { createStatsDClient } from './createStatsDClient.js';

describe('createStatsDClient', () => {
  it('should create a new mock client', () => {
    expect(
      createStatsDClient(StatsD, {
        name: 'test',
      }),
    ).toBeInstanceOf(Object);
  });

  it('should handle null config values', () => {
    expect(
      createStatsDClient(StatsD, {
        metricsServer: null,
        name: 'test',
      }),
    ).toBeInstanceOf(Object);
  });

  it('should support the environment config option', () => {
    process.env.DD_ENV = 'my_env';
    process.env.DD_SERVICE = 'my_service';
    process.env.DD_VERSION = 'my_version';

    const client = createStatsDClient(StatsD, {
      environment: 'deprecated-but-still-here',
      metricsServer: null,
      name: 'test',
    });

    client.distribution('dist', 2);

    expect(client.mockBuffer).toMatchInlineSnapshot(`
      [
        "test.dist:2|d|#env:deprecated-but-still-here",
      ]
    `);
  });

  it('should allow reading Datadog tags from environment', () => {
    process.env.DD_ENV = 'my_env';
    process.env.DD_SERVICE = 'my_service';
    process.env.DD_VERSION = 'my_version';

    const client = createStatsDClient(StatsD, {
      environment: 'dd_env_takes_precedence_over_me',
      includeDataDogTags: true,
      metricsServer: null,
      name: 'test',
    });

    client.increment('counter');

    expect(client.mockBuffer).toMatchInlineSnapshot(`
      [
        "test.counter:1|c|#env:my_env,service:my_service,version:my_version",
      ]
    `);
  });
});
