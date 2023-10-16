import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { productListMock } from "@mocks/product-list.mock";
import { Product } from "@models/product.model";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoStock } from "@models/stock.model";
import { configDotenv } from "dotenv";

configDotenv();

const client = new DynamoDBClient({
    region: process.env.PROVIDER_REGION
});

async function mockTable(tableName: string): Promise<void> {
    const putRequests = productListMock.map((product: Product) => {
        const dynamoDbStockItem: DynamoStock = {
            product_id: product.id,
            count: product.count
        };

        return {
            PutRequest: {
                Item: marshall(dynamoDbStockItem)
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

mockTable(process.env.DYNAMODB_STOCK_TABLE_NAME);
