import * as datadogJS from 'datadog-lambda-js';

import { createLambdaExtensionClient } from './createLambdaExtensionClient';

const sendDistributionMetric = jest
  .spyOn(datadogJS, 'sendDistributionMetric')
  .mockReturnValue();

const datadog = jest.spyOn(datadogJS, 'datadog').mockReturnValue(() => {});

describe('createLambdaExtensionClient', () => {
  const { metricsClient, withLambdaExtension } = createLambdaExtensionClient({
    name: 'test',
    metrics: true,
  });

  const tags = ['pipe|special|char', 'env:prod'];

  afterEach(() => jest.resetAllMocks());

  describe('withLambdaExtension', () => {
    it('should call the `datadog` wrapper', () => {
      withLambdaExtension(() => Promise.resolve({}));

      expect(datadog).toHaveBeenCalledTimes(1);
    });
  });

  describe('timing', () => {
    it('should record integer timings without tags', () => {
      metricsClient.timing('my_custom_metric', 100);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        100,
      );
    });

    it('should record float timings with tags', () => {
      metricsClient.timing('my_custom_metric', 1234.5, tags);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        1234.5,
        'pipe_special_char',
        'env:prod',
      );
    });
  });

  describe('distribution', () => {
    it('should record integer values without tags', () => {
      metricsClient.distribution('my_custom_metric', 100);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        100,
      );
    });

    it('should record float values with tags', () => {
      metricsClient.distribution('my_custom_metric', 1234.5, tags);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        1234.5,
        'pipe_special_char',
        'env:prod',
      );
    });
  });

  describe('increment', () => {
    it('should increment with an implicit value and no tags', () => {
      metricsClient.increment('my_custom_metric');

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        1,
      );
    });

    it('should increment with an implicit value and tags', () => {
      metricsClient.increment('my_custom_metric', ['comma,special,char']);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        1,
        'comma_special_char',
      );
    });

    it('should increment with an explicit value and no tags', () => {
      metricsClient.increment('my_custom_metric', 10);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        10,
      );
    });

    it('should increment with an explicit value and tags', () => {
      metricsClient.increment('my_custom_metric', 10, ['compound:tag']);

      expect(sendDistributionMetric).toHaveBeenCalledTimes(1);
      expect(sendDistributionMetric).toHaveBeenCalledWith(
        'test.my_custom_metric',
        10,
        'compound:tag',
      );
    });
  });
});
