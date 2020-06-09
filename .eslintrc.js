module.exports = {
  extends: [require.resolve('skuba/config/eslint')],
  plugins: ['eslint-plugin-tsdoc'],
  rules: {
    'tsdoc/syntax': 'error',
  },
};
