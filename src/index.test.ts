import {
  createCloudWatchClient,
  createNoOpClient,
  createStatsDClient,
  createTimedSpan,
} from './';

describe('index', () => {
  it('should export a createStatsDClient function', () => {
    expect(createStatsDClient).toBeInstanceOf(Function);
  });

  it('should export a createCloudWatchClient function', () => {
    expect(createCloudWatchClient).toBeInstanceOf(Function);
  });

  it('should export a createEmptyClient function', () => {
    expect(createNoOpClient).toBeInstanceOf(Function);
  });

  it('should export a timedSpan function', () => {
    expect(createTimedSpan).toBeInstanceOf(Function);
  });
});
