import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { productListMock } from "@mocks/product-list.mock";

const getProductById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
    console.log(`getProductById LOG: Input args`, event);

    const productId = event.pathParameters?.productId;
    const product = productListMock.find(product => product.id === productId);

    if (!product) {
        return formatJSONResponse(errorResponse("Product not found"), 404)
    }

    return formatJSONResponse(product);
};

export const main = middyfy(getProductById);
