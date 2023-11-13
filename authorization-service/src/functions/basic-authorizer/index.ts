import { handlerPath } from "@libs/handler-resolver";

export default {
    name: "basicAuthorizer",
    handler: `${handlerPath(__dirname)}/handler.main`
};
