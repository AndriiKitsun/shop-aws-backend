import { ErrorModel } from "@models/error.model";
import { randomUUID } from "crypto";

export const formatJSONResponse = <T>(response?: T, statusCode?: number) => {
    return {
        statusCode: statusCode ?? 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: response ? JSON.stringify(response) : null
    }
}

export const errorResponse = (message: string): ErrorModel => {
    return {
        id: randomUUID(),
        timestamp: new Date().toJSON(),
        message
    }
}
