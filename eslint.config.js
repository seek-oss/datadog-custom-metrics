const skuba = require('eslint-config-skuba');

const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    extends: skuba,
  },
]);
