import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { productListMock } from "@mocks/product-list.mock";

const getProductList: ValidatedEventAPIGatewayProxyEvent<unknown> = async () => {
    return formatJSONResponse(productListMock);
};

export const main = middyfy(getProductList);
