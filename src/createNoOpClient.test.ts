import createNoOpClient from './createNoOpClient';

describe('createNoOpClient', () => {
  const metricsClient = createNoOpClient();

  afterEach(() => jest.resetAllMocks());

  describe('timing', () => {
    it('should be a no op', () => {
      expect(() =>
        metricsClient.timing('my_custom_metric', 100),
      ).toBeInstanceOf(Function);
    });

    describe('histogram', () => {
      it('should be a no op', () => {
        expect(() =>
          metricsClient.histogram('my_custom_metric', 100),
        ).toBeInstanceOf(Function);
      });
    });

    describe('increment', () => {
      it('should be a no op', () => {
        expect(() =>
          metricsClient.increment('my_custom_metric', 1),
        ).toBeInstanceOf(Function);
      });
    });

    describe('decrement', () => {
      it('should be a no op', () => {
        expect(() =>
          metricsClient.decrement('my_custom_metric', 1),
        ).toBeInstanceOf(Function);
      });
    });
  });
});
