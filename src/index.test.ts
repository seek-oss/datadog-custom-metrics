import {
  createCloudWatchClient,
  createLambdaExtensionClient,
  createNoOpClient,
  createStatsDClient,
  createTimedSpan,
  httpTracingConfig,
} from './';

describe('index', () => {
  it('should export a createStatsDClient function', () => {
    expect(createStatsDClient).toBeInstanceOf(Function);
  });

  it('should export a createCloudWatchClient function', () => {
    expect(createCloudWatchClient).toBeInstanceOf(Function);
  });

  it('should export a createLambdaExtensionClient function', () => {
    expect(createLambdaExtensionClient).toBeInstanceOf(Function);
  });

  it('should export a createNoOpClient function', () => {
    expect(createNoOpClient).toBeInstanceOf(Function);
  });

  it('should export a createTimedSpan function', () => {
    expect(createTimedSpan).toBeInstanceOf(Function);
  });

  it('should export a httpTracingConfig object', () => {
    expect(httpTracingConfig).toBeInstanceOf(Object);
  });
});
