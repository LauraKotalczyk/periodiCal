

const config = {
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/expo-env.d.ts',
    '!**/.expo/**',
    '!**/__tests__/**',               // don't count test files themselves
    '!**/*.test.{ts,tsx,js,jsx}',     // alternative pattern
  ],
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // This is crucial: allow jest-expo to transpile Expo and React Native modules
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|drizzle-orm|uuid))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'node',      // we don't need native DOM for database tests
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    // Transform TypeScript with ts-jest
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};

module.exports = config;