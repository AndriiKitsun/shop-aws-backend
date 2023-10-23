import { ApiServiceBase } from "./api.service-base";
import { ScanCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { DynamoProduct } from "@models/product.model";

class ProductService extends ApiServiceBase {
    protected readonly tableName = process.env.DYNAMODB_PRODUCT_TABLE_NAME;

    public async getProducts(): Promise<DynamoProduct[]> {
        const command = new ScanCommand({
            TableName: this.tableName,
        });

        const response = await this.client.send(command);

        return response.Items.map(item => unmarshall(item) as DynamoProduct);
    }

    public async getProductById(productId: string): Promise<DynamoProduct> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: {S: productId}
            }
        });

        const response = await this.client.send(command);

        if (!response.Item) {
            return null;
        }

        return unmarshall(response.Item) as DynamoProduct;
    }

    public async createProduct(productDto: Partial<DynamoProduct>): Promise<void> {
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: marshall(productDto, {
                removeUndefinedValues: true,
            })
        });

        await this.client.send(command);
    }
}

export default new ProductService();
