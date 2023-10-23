import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { productListMock } from "@mocks/product-list.mock";
import { Product, DynamoProduct } from "@models/product.model";
import { marshall } from "@aws-sdk/util-dynamodb";
import { configDotenv } from "dotenv";

configDotenv();

const client = new DynamoDBClient({
    region: process.env.PROVIDER_REGION
});

async function mockTable(tableName: string): Promise<void> {
    const putRequests = productListMock.map((product: Product) => {
        const dynamoDbProduct: DynamoProduct = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price
        };

        return {
            PutRequest: {
                Item: marshall(dynamoDbProduct)
            }
        }
    });

    const command = new BatchWriteItemCommand({
        RequestItems: {
            [tableName]: putRequests,
        },
    });

    await client.send(command);
}

mockTable(process.env.DYNAMODB_PRODUCT_TABLE_NAME)
