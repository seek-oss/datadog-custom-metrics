import { StatsD } from 'hot-shots';

import MetricsClient from './MetricsClient';

describe('MetricsClient', () => {
  it("should be a subset of hot-shot's StatsD", () => {
    const client = new StatsD({
      mock: true,
    });

    if (client.socket) {
      client.socket.close();
    }

    const metricsClient: MetricsClient = client;
    expect(metricsClient).toBeDefined();
  });
});
