/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: '.',
  testRegex: '.spec.ts$',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
      tsconfig: {
        ...require('./tsconfig.json').compilerOptions,
        allowJs: true,
        checkJs: false,
        downlevelIteration: true,
        declaration: false,
      },
    },
  },
  bail: true,
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  transformIgnorePatterns: ['/node_modules/', '/scripts/'],
  coveragePathIgnorePatterns: [
    '/migrations/',
    'orm.ts',
    'main.ts',
    '.config.ts',
    '/test/',
    'jest.',
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      branches: 70,
      lines: 80,
      statements: 90,
    },
    '**/*.service.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    '**/*.controller.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    '**/*.module.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    '**/*.ts': {
      branches: 70,
      functions: 100,
      lines: 80,
      statements: 80,
    },
  },
}
