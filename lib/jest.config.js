module.exports = {
  restoreMocks: true,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: [
    '<rootDir>/lib/src/setupJest.ts'
  ]
};
