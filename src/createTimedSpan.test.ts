import createStatsDClient from './createStatsDClient';
import createTimedSpan from './createTimedSpan';

const metricsClient = createStatsDClient({
  name: 'jest',
  version: '0.0.1',
  environment: 'dev',
});

const timedSpan = createTimedSpan(metricsClient);

describe('timedSpan', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle successful completion', async () => {
    const mockIncrement = jest.spyOn(metricsClient, 'increment');
    const mockTiming = jest.spyOn(metricsClient, 'timing');

    const result = await timedSpan(
      'test',
      // This is false but we still successfully resolved
      () => Promise.resolve(false),
    );

    expect(result).toBe(false);

    expect(mockIncrement).toHaveBeenCalledTimes(1);
    {
      const [name, tags] = mockIncrement.mock.calls[0];

      expect(name).toBe('test.count');
      expect(tags).toEqual(['success']);
    }

    expect(mockTiming).toHaveBeenCalledTimes(1);
    {
      const [name, latency] = mockTiming.mock.calls[0];

      expect(name).toBe('test.latency');
      expect(latency).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle failure', async () => {
    const mockIncrement = jest.spyOn(metricsClient, 'increment');
    const mockTiming = jest.spyOn(metricsClient, 'timing');

    await expect(
      timedSpan('test', () => {
        throw new Error('Some error');
      }),
    ).rejects.toMatchObject({ message: 'Some error' });

    expect(mockIncrement).toHaveBeenCalledTimes(1);
    {
      const [name, tags] = mockIncrement.mock.calls[0];

      expect(name).toBe('test.count');
      expect(tags).toEqual(['failure']);
    }

    expect(mockTiming).toHaveBeenCalledTimes(1);
    {
      const [name, latency] = mockTiming.mock.calls[0];

      expect(name).toBe('test.latency');
      expect(latency).toBeGreaterThanOrEqual(0);
    }
  });
});
