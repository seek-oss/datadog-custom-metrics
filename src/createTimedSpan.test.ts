import { StatsD } from 'hot-shots';

import { createStatsDClient } from './createStatsDClient.js';
import { createTimedSpan } from './createTimedSpan.js';

const metricsClient = createStatsDClient(StatsD, {
  name: 'jest',
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
      const [name, tags] = mockIncrement.mock.calls[0] ?? [];

      expect(name).toBe('test.count');
      expect(tags).toEqual(['success']);
    }

    expect(mockTiming).toHaveBeenCalledTimes(1);
    {
      const [name, latency] = mockTiming.mock.calls[0] ?? [];

      expect(name).toBe('test.latency');
      expect(latency).toBeGreaterThanOrEqual(0);
    }
  });

  it('should call afterCompletion', async () => {
    jest.spyOn(metricsClient, 'increment');
    jest.spyOn(metricsClient, 'timing');

    let duration = 0;

    const result = await timedSpan(
      'test',
      // This is false but we still successfully resolved
      () => Promise.resolve(false),
      (timedDuration) => {
        duration = timedDuration;
      },
    );

    expect(result).toBe(false);

    // Hopefully this doesn't become flaky and end up as 0
    expect(duration).toBeGreaterThan(0);
  });

  it('should pass along tags from `timedSpan`', async () => {
    const mockIncrement = jest.spyOn(metricsClient, 'increment');
    const mockTiming = jest.spyOn(metricsClient, 'timing');

    await timedSpan(
      'test',
      // This is false but we still successfully resolved
      () => Promise.resolve(false),
      () => undefined,
      ['new-tags'],
    );

    expect(mockIncrement).toHaveBeenCalledWith('test.count', [
      'success',
      'new-tags',
    ]);

    expect(mockTiming).toHaveBeenCalledWith(
      'test.latency',
      expect.any(Number),
      ['new-tags'],
    );
  });

  it('should pass along tags from `afterCompletion`', async () => {
    const mockIncrement = jest.spyOn(metricsClient, 'increment');
    const mockTiming = jest.spyOn(metricsClient, 'timing');

    await timedSpan(
      'test',
      // This is false but we still successfully resolved
      () => Promise.resolve(false),
      () => ({ tags: ['tags-from-after-completion'] }),
      ['new-tags'],
    );

    expect(mockIncrement).toHaveBeenCalledWith('test.count', [
      'success',
      'new-tags',
      'tags-from-after-completion',
    ]);

    expect(mockTiming).toHaveBeenCalledWith(
      'test.latency',
      expect.any(Number),
      ['new-tags', 'tags-from-after-completion'],
    );
  });

  it("should pass along tags from `afterCompletion` when original tags aren't provided", async () => {
    const mockIncrement = jest.spyOn(metricsClient, 'increment');
    const mockTiming = jest.spyOn(metricsClient, 'timing');

    await timedSpan(
      'test',
      // This is false but we still successfully resolved
      () => Promise.resolve(false),
      () => ({ tags: ['tags-from-after-completion'] }),
    );

    expect(mockIncrement).toHaveBeenCalledWith('test.count', [
      'success',
      'tags-from-after-completion',
    ]);

    expect(mockTiming).toHaveBeenCalledWith(
      'test.latency',
      expect.any(Number),
      ['tags-from-after-completion'],
    );
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
      const [name, tags] = mockIncrement.mock.calls[0] ?? [];

      expect(name).toBe('test.count');
      expect(tags).toEqual(['failure']);
    }

    expect(mockTiming).toHaveBeenCalledTimes(1);
    {
      const [name, latency] = mockTiming.mock.calls[0] ?? [];

      expect(name).toBe('test.latency');
      expect(latency).toBeGreaterThanOrEqual(0);
    }
  });
});
