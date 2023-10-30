/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@functions/(.*)$": "<rootDir>/src/functions/$1",
        "^@libs/(.*)$": "<rootDir>/src/libs/$1",
        "^@models/(.*)$": "<rootDir>/src/models/$1",
        "^@services/(.*)$": "<rootDir>/src/services/$1",
    },
};
