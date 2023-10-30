import { handlerPath } from "@libs/handler-resolver";

export default {
    name: "catalogBatchProcess",
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            sqs: {
                arn: {
                    "Fn::GetAtt": ["catalogItemsQueue", "Arn"]
                },
                batchSize: 5
            }
        },
    ],
};
