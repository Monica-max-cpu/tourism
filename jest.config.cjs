module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^/@/(.*)$': '<rootDir>/src/$1',
    '^/#/(.*)$': '<rootDir>/types/$1',
  },
  testMatch: ['**/__tests__/**/*.spec.ts'],
};
