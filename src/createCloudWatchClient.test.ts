import createCloudWatchClient from './createCloudWatchClient';

describe('createCloudWatchClient', () => {
  const metricsClient = createCloudWatchClient({
    name: 'test',
    environment: 'jest',
  });

  const stdoutSpy = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 31337);
  });

  afterEach(() => jest.resetAllMocks());

  describe('timing', () => {
    it('should record integer timings without tags', () => {
      metricsClient.timing('my_custom_metric', 100);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|100|histogram|test.my_custom_metric|#env:jest
        "
      `);
    });

    it('should record float timings with tags', () => {
      metricsClient.timing('my_custom_metric', 1234.5, ['pipe|special|char']);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|1234.5|histogram|test.my_custom_metric|#env:jest,pipe_special_char
        "
      `);
    });
  });

  describe('histogram', () => {
    it('should record integer values without tags', () => {
      metricsClient.histogram('my_custom_metric', 100);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|100|histogram|test.my_custom_metric|#env:jest
        "
      `);
    });

    it('should record float values with tags', () => {
      metricsClient.histogram('my_custom_metric', 1234.5, [
        'pipe|special|char',
      ]);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|1234.5|histogram|test.my_custom_metric|#env:jest,pipe_special_char
        "
      `);
    });
  });

  describe('increment', () => {
    it('should increment with an implicit value and no tags', () => {
      metricsClient.increment('my_custom_metric');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|1|count|test.my_custom_metric|#env:jest
        "
      `);
    });

    it('should increment with an implicit value and tags', () => {
      metricsClient.increment('my_custom_metric', ['comma,special,char']);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|1|count|test.my_custom_metric|#env:jest,comma_special_char
        "
      `);
    });

    it('should increment with an explicit value and no tags', () => {
      metricsClient.increment('my_custom_metric', 10);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|10|count|test.my_custom_metric|#env:jest
        "
      `);
    });

    it('should increment with an explicit value and tags', () => {
      metricsClient.increment('my_custom_metric', 10, ['compound:tag']);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|10|count|test.my_custom_metric|#env:jest,compound:tag
        "
      `);
    });
  });

  describe('decrement', () => {
    it('should decrement with an implicit value', () => {
      metricsClient.decrement('my_custom_metric');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|-1|count|test.my_custom_metric|#env:jest
        "
      `);
    });

    it('should decrement with an explicit value', () => {
      metricsClient.decrement('my_custom_metric', 10);

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy.mock.calls[0][0]).toMatchInlineSnapshot(`
        "MONITORING|31337|-10|count|test.my_custom_metric|#env:jest
        "
      `);
    });
  });
});
