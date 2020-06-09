module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      lines: 100,
      functions: 100,
    },
  },
  collectCoverageFrom: ['src/**/*.ts'],
};
