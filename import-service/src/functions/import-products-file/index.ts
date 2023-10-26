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
                }
            },
        },
    ],
};
