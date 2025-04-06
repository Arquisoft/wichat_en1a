// jest.config.js
module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.js",
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
    ],
    coverageReporters: ['text', 'lcov'],
};
