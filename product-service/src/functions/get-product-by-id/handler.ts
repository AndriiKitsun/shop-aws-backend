import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productService from "../../services/product.service";
import stockService from "../../services/stock.service";
import { Product } from "@models/product.model";

const getProductById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
    console.log(`getProductById LOG: Input args`, event);

    try {
        const productId = event.pathParameters?.productId;
        const dynamoProduct = await productService.getProductById(productId);

        if (!dynamoProduct) {
            return formatJSONResponse(errorResponse("Product not found"), 404);
        }

        const stock = await stockService.getStockByProductId(productId);

        const product: Product = {
            id: dynamoProduct.id,
            title: dynamoProduct.title,
            description: dynamoProduct.description,
            price: dynamoProduct.price,
            count: stock?.count ?? 0,
        }

        return formatJSONResponse(product);
    } catch (err) {
        console.error(`getProductById ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500)
    }
};

export const main = middyfy(getProductById);
