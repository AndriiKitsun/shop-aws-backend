import { handlerPath } from "@libs/handler-resolver";

export default {
    name: "importProductsFile",
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: `import`,
                cors: true,
                request: {
                    parameters: {
                        querystrings: {
                            name: true
                        }
                    }
                },
                authorizer: {
                    name: 'import-authorizer',
                    arn: process.env.BASIC_AUTHORIZER_LAMBDA_ARN,
                    identitySource: 'method.request.header.Authorization',
                    type: 'token'
                }
            },
        },
    ],
};
