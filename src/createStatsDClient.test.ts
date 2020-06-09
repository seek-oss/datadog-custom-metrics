import createStatsDClient from './createStatsDClient';

describe('createStatsDClient', () => {
  it('should create a new mock client', () => {
    expect(
      createStatsDClient({ name: 'test', environment: 'jest', version: '0' }),
    ).toBeInstanceOf(Object);
  });
});
