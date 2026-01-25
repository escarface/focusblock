// Jest configuration for FocusBlocks
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|expo|@expo)/)',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/\\.[^/]+/',
  ],
  passWithNoTests: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
};
