const { defineConfig } = require('eslint/config');
const skuba = require('eslint-config-skuba');

module.exports = defineConfig([
  {
    extends: skuba,
  },
]);
