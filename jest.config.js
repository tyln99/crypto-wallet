module.exports = {
  // collectCoverage: true, // turn of auto export coverage report
  collectCoverageFrom: ['<rootDir>/app/**/*.{js,jsx}'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/mocks/assetsTransformer.js'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!pify|uuid|nanoid)'],
  moduleNameMapper: {
    '^@ui(.*)$': '<rootDir>/ui$1',
    '^@resources(.*)$': '<rootDir>/ui/resources$1',
    '^@components(.*)$': '<rootDir>/ui/components$1',
    '^@hooks(.*)$': '<rootDir>/ui/hooks$1',
    '^@pages(.*)$': '<rootDir>/ui/pages$1',
    '^@config(.*)$': '<rootDir>/ui/config$1',
    '^@common(.*)$': '<rootDir>/ui/common$1',
    '^@actions(.*)$': '<rootDir>/ui/actions$1',
    '^@services(.*)$': '<rootDir>/ui/services$1',
    '^@selectors(.*)$': '<rootDir>/ui/selectors$1',
    '^@mock(.*)$': '<rootDir>/ui/mock$1',
    '^@assets(.*)$': '<rootDir>/ui/assets$1',
    '^@thunks(.*)$': '<rootDir>/ui/thunks$1',
    '^@providers(.*)$': '<rootDir>/ui/providers$1',
    '^@store(.*)$': '<rootDir>/ui/store$1',
    '^@app(.*)$': '<rootDir>/app$1',
    '^@shared(.*)$': '<rootDir>/shared$1',
    '^@styles(.*)$': '<rootDir>/ui/resources/scss',
    '^@images(.*)$': '<rootDir>/ui/resources/images',
    '\\.(scss|css|less)$': '<rootDir>/test/mocks/styleMock.js'
  }
}
