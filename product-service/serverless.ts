import type { AWS } from '@serverless/typescript';
import { createProduct, getProductList, getProductById, catalogBatchProcess } from "@functions/index";
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
            PRODUCT_SNS_TOPIC_ARN: {
                "Ref": "createProductTopic"
            }
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: [
                    "dynamodb:*"
                ],
                Resource: "*"
            },
            {
                Effect: "Allow",
                Action: [
                    "SQS:ReceiveMessage"
                ],
                Resource: {
                    "Fn::GetAtt": ["catalogItemsQueue", "Arn"]
                }
            },
            {
                Effect: "Allow",
                Action: [
                    "sns:*"
                ],
                Resource: {
                    "Ref": "createProductTopic"
                }
            }
        ]
    },
    functions: {
        createProduct,
        getProductById,
        getProductList,
        catalogBatchProcess
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
            catalogItemsQueue: {
                Type: "AWS::SQS::Queue",
                Properties: {
                    QueueName: process.env.PRODUCT_SQS_NAME
                }
            },
            createProductTopic: {
                Type: "AWS::SNS::Topic",
                Properties: {
                    DisplayName: process.env.PRODUCT_SNS_TOPIC_DISPLAY_NAME,
                    TopicName: process.env.PRODUCT_SNS_TOPIC_NAME
                }
            },
            createProductEmailSubscription: {
                Type: "AWS::SNS::Subscription",
                Properties: {
                    Protocol: "email",
                    TopicArn: {
                        "Ref": "createProductTopic"
                    },
                    Endpoint: process.env.PRODUCT_SNS_SUBSCRIPTION_ENDPOINT,
                    FilterPolicy: {
                        "user-group": ["managers"]
                    }
                }
            },
            createUserEmailSubscription: {
                Type: "AWS::SNS::Subscription",
                Properties: {
                    Protocol: "email",
                    TopicArn: {
                        "Ref": "createProductTopic"
                    },
                    Endpoint: process.env.PRODUCT_SNS_SUBSCRIPTION_USER_ENDPOINT,
                    FilterPolicy: {
                        "user-group": ["users"]
                    }
                }
            }
        }
    }
};

module.exports = serverlessConfiguration;
