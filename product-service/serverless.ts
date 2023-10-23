import type { AWS } from '@serverless/typescript';
import { createProduct, getProductList, getProductById } from "@functions/index";
import { configDotenv } from "dotenv";

configDotenv();

const serverlessConfiguration: AWS = {
    service: 'product-service',
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
            DYNAMODB_PRODUCT_TABLE_NAME: process.env.DYNAMODB_PRODUCT_TABLE_NAME,
            DYNAMODB_STOCK_TABLE_NAME: process.env.DYNAMODB_STOCK_TABLE_NAME,
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: [
                    "dynamodb:*"
                ],
                Resource: "*"
            }
        ]
    },
    functions: {
        createProduct,
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
    resources: {
        Resources: {
            productsDynamoDBTable: {
                Type: "AWS::DynamoDB::Table",
                Properties: {
                    TableName: process.env.DYNAMODB_PRODUCT_TABLE_NAME,
                    AttributeDefinitions: [
                        {
                            AttributeName: "id",
                            AttributeType: "S"
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: "id",
                            KeyType: "HASH"
                        }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5
                    }
                }
            },
            stocksDynamoDBTable: {
                Type: "AWS::DynamoDB::Table",
                Properties: {
                    TableName: process.env.DYNAMODB_STOCK_TABLE_NAME,
                    AttributeDefinitions: [
                        {
                            AttributeName: "product_id",
                            AttributeType: "S"
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: "product_id",
                            KeyType: "HASH"
                        }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5
                    }
                }
            },
        }
    }
};

module.exports = serverlessConfiguration;
