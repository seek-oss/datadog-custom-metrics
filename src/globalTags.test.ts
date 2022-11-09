import { globalTags } from './globalTags';

describe('globalTags', () => {
  it('should generate `env` and `version` tags', () => {
    expect(
      globalTags({ name: 'unused', environment: 'prod', version: '1234' }),
    ).toEqual(['env:prod', 'version:1234']);
  });

  it("should generate only `env` when `version` isn't specified", () => {
    expect(globalTags({ name: 'unused', environment: 'dev' })).toEqual([
      'env:dev',
    ]);
  });
});
