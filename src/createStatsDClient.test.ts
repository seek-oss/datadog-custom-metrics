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
    delete process.env.DD_ENV;
    delete process.env.DD_SERVICE;
    delete process.env.DD_VERSION;

    const client = createStatsDClient(StatsD, {
      metricsServer: null,
      name: 'test',
    });

    client.timing('timing', new Date(1));

    expect(client.mockBuffer).toMatchInlineSnapshot(`
      [
        "test.timing:1754822723343|ms",
      ]
    `);
  });

  it('should support the environment config option', () => {
    delete process.env.DD_ENV;
    delete process.env.DD_SERVICE;
    delete process.env.DD_VERSION;

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

  it('should append DD_ENV from environment', () => {
    process.env.DD_ENV = 'env_var';
    process.env.DD_SERVICE = 'my_service';
    process.env.DD_VERSION = 'my_version';

    const client = createStatsDClient(StatsD, {
      environment: 'client_config',
      metricsServer: null,
      name: 'test',
    });

    client.increment('counter');

    expect(client.mockBuffer).toMatchInlineSnapshot(`
      [
        "test.counter:1|c|#env:client_config,env:env_var",
      ]
    `);
  });
});
