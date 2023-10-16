import { handlerPath } from "@libs/handler-resolver";

export default {
    name: "createProduct",
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: `products`,
                cors: true
            },
        },
    ],
};
