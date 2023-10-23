import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export abstract class ApiServiceBase {
    protected client: DynamoDBClient;
    protected abstract readonly tableName: string;

    constructor() {
        this.client = new DynamoDBClient({
            region: process.env.PROVIDER_REGION,
        });
    }
}
