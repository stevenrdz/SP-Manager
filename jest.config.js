const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/app/api/**/*.ts',
    '!src/app/api/**/route.ts', // Excluir temporalmente
    'src/application/**/*.ts',
    'src/infrastructure/**/*.ts',
  ],
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // Increased for MongoDB connection
  verbose: true,
}

module.exports = createJestConfig(customJestConfig)
