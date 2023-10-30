import { SNSClient, PublishCommand, PublishCommandOutput, PublishCommandInput } from "@aws-sdk/client-sns";

class ProductSnsService {
    private readonly client: SNSClient;

    constructor() {
        this.client = new SNSClient();
    }

    public async publishMessage(message: Record<string, unknown>): Promise<PublishCommandOutput> {
        const args: PublishCommandInput = {
            TopicArn: process.env.PRODUCT_SNS_TOPIC_ARN,
            Message: JSON.stringify(message),
            MessageAttributes: {
                'user-group': {
                    DataType: 'String',
                    StringValue: 'managers'
                }
            }
        }

        const command = new PublishCommand(args);

        return await this.client.send(command);
    }
}

export default new ProductSnsService()
