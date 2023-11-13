import { ApiServiceBase } from "./api.service-base";
import { ScanCommand, AttributeValue, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { DynamoStock, DynamoNormalizedStock } from "@models/stock.model";

export class StockService extends ApiServiceBase {
    protected readonly tableName = process.env.DYNAMODB_STOCK_TABLE_NAME;

    public async getStocks(): Promise<DynamoNormalizedStock> {
        const command = new ScanCommand({
            TableName: this.tableName,
        });

        const response = await this.client.send(command);

        return response.Items.reduce((acc: DynamoNormalizedStock, item: Record<string, AttributeValue>) => {
            const stockItem = unmarshall(item) as DynamoStock;
            acc[stockItem.product_id] = stockItem;

            return acc;
        }, {});
    }

    public async getStockByProductId(productId: string): Promise<DynamoStock> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                product_id: { S: productId }
            }
        });

        const response = await this.client.send(command);

        if (!response.Item) {
            return null;
        }

        return unmarshall(response.Item) as DynamoStock;
    }

    public async createStockItem(stockDto: Partial<DynamoStock>): Promise<void> {
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: marshall(stockDto, {
                removeUndefinedValues: true,
            })
        });

        await this.client.send(command);
    }
}

export default new StockService();
