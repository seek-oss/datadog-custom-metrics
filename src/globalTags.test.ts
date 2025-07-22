import { globalTags } from './globalTags';

describe('globalTags', () => {
  it('should generate `env` tag when environment is supplied', () => {
    expect(globalTags({ name: 'unused', environment: 'prod' })).toStrictEqual([
      'env:prod',
    ]);
  });

  it('should generate no tags when environment is not specified', () => {
    expect(globalTags({ name: 'unused' })).toStrictEqual([]);
  });
});
