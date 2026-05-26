import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

// Añadir configuración personalizada para Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/app/modules/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
