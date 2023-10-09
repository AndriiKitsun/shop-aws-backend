import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";
import { ErrorModel } from "@models/error.model";
import { nanoid } from "nanoid";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = <T>(response: T, statusCode?: number) => {
    return {
        statusCode: statusCode ?? 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(response)
    }
}

export const errorResponse = (message: string): ErrorModel => {
    return {
        id: nanoid(),
        timestamp: new Date().toJSON(),
        message
    }
}
