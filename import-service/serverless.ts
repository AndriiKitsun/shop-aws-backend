import type { AWS } from '@serverless/typescript';
import { importProductsFile, importFileParser } from "@functions/index";
import { configDotenv } from "dotenv";

configDotenv();

const serverlessConfiguration: AWS = {
    service: 'import-service',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        runtime: 'nodejs18.x',
        stage: "dev",
        region: process.env.PROVIDER_REGION as any,
        apiGateway: {
            minimumCompressionSize: 128,
            shouldStartNameWithService: true,
        },
        environment: {
            PROVIDER_REGION: process.env.PROVIDER_REGION,
            IMPORT_FILE_STORAGE_NAME: process.env.IMPORT_FILE_STORAGE_NAME
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: [
                    "s3:GetObject",
                    "s3:GetObjectTagging",
                    "s3:PutObject",
                    "s3:PutObjectTagging"
                ],
                Resource: [
                    `arn:aws:s3:::${process.env.IMPORT_FILE_STORAGE_NAME}/*`
                ]
            },
            {
                Effect: "Allow",
                Action: [
                    "s3:ListBucket"
                ],
                Resource: [
                    `arn:aws:s3:::${process.env.IMPORT_FILE_STORAGE_NAME}`
                ]
            }
        ]
    },
    functions: {
        importFileParser,
        importProductsFile
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

    },
    resources: {
        Resources: {
            importServiceS3: {
                Type: "AWS::S3::Bucket",
                Properties: {
                    BucketName: process.env.IMPORT_FILE_STORAGE_NAME
                }
            }
        }
    }
};

module.exports = serverlessConfiguration;
