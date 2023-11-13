import { SQSClient, SendMessageCommandOutput, SendMessageCommand } from "@aws-sdk/client-sqs";

class ProductSqsService {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient({
            region: process.env.PROVIDER_REGION,
        });
    }

    public sendMessage(message: Record<string, unknown>): Promise<SendMessageCommandOutput> {
        const command = new SendMessageCommand({
            QueueUrl: process.env.PRODUCT_SQS_URL,
            MessageBody: JSON.stringify(message)
        });

        return this.client.send(command);
    }
}

export default new ProductSqsService()
