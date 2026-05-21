import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^../config/db$': '<rootDir>/__mocks__/db.ts',
    '^./config/db$': '<rootDir>/__mocks__/db.ts',
  },
  clearMocks: true,
  verbose: true,
}

export default config

