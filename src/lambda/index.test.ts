import { createLambdaExtensionClient } from './index.js';

it('should export a createLambdaExtensionClient function', () => {
  expect(createLambdaExtensionClient).toBeInstanceOf(Function);
});
