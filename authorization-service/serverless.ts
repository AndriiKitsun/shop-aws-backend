import type { AWS } from '@serverless/typescript';
import { basicAuthorizer } from "@functions/index";
import { configDotenv } from "dotenv";

configDotenv();

const serverlessConfiguration: AWS = {
    service: 'authorization-service',
    frameworkVersion: '3',
    plugins: [
        'serverless-esbuild',
        'serverless-dotenv-plugin'
    ],
    useDotenv: true,
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        stage: "dev",
        region: process.env.PROVIDER_REGION as any,
        apiGateway: {
            minimumCompressionSize: 128,
            shouldStartNameWithService: true,
        },
    },
    functions: {
        basicAuthorizer
    },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: true,
            sourcemap: false,
            exclude: ['aws-sdk'],
            target: 'node18',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    }
};

module.exports = serverlessConfiguration;
