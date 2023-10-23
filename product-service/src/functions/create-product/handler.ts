import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productService from "../../services/product.service";
import { DynamoProduct } from "@models/product.model";
import { randomUUID } from "crypto";
import { HttpError } from "@libs/http-error";

const createProduct: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
    console.log(`createProduct LOG: Input args`, event);

    try {
        validateProductBody(event.body);
        const productPayload = handleProductBody(event.body);
        await productService.createProduct(productPayload);

        return formatJSONResponse('', 201);
    } catch (err) {
        console.error(`createProduct ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);
    }
};

function validateProductBody(body: any): void {
    if (!body?.title) {
        throw new HttpError("The 'title' field is required for Product entry", 400)
    }
}

function handleProductBody(body: any): Partial<DynamoProduct> {
    return {
        id: randomUUID(),
        title: body?.title,
        description: body?.description,
        price: body?.price
    };
}

export const main = middyfy(createProduct);
