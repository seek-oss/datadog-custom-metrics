import { createLambdaExtensionClient } from './createLambdaExtensionClient.js';

it('should export a createLambdaExtensionClient function', () => {
  expect(createLambdaExtensionClient).toBeInstanceOf(Function);
});
