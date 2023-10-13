import { handlerPath } from "@libs/handler-resolver";

export default {
    name: "getProductById",
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: `products/{productId}`,
                cors: true
            },
        },
    ],
};
