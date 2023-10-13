import type { AWS } from '@serverless/typescript';
import { getProductList, getProductById } from "@functions/index";

const serverlessConfiguration: AWS = {
    service: 'product-service',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        stage: "dev",
        region: "eu-west-1",
        apiGateway: {
            minimumCompressionSize: 128,
            shouldStartNameWithService: true,
        }
    },
    functions: {
        getProductById,
        getProductList
    },
    package: {individually: true},
    custom: {
        esbuild: {
            bundle: true,
            minify: true,
            sourcemap: false,
            exclude: ['aws-sdk'],
            target: 'node18',
            define: {'require.resolve': undefined},
            platform: 'node',
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;
