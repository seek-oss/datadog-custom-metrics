import { createNoOpClient } from './createNoOpClient';

describe('createNoOpClient', () => {
  const metricsClient = createNoOpClient();

  afterEach(() => jest.resetAllMocks());

  describe('timing', () => {
    it('should not throw', () => {
      metricsClient.timing('my_custom_metric', 100);
    });

    describe('histogram', () => {
      it('should not throw', () => {
        metricsClient.histogram('my_custom_metric', 100);
      });
    });

    describe('increment', () => {
      it('should not throw', () => {
        metricsClient.increment('my_custom_metric', 1);
      });
    });

    describe('decrement', () => {
      it('should not throw', () => {
        metricsClient.decrement('my_custom_metric', 1);
      });
    });
  });
});
