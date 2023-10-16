import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productService from "../../services/product.service";
import stockService from "../../services/stock.service";
import { Product } from "@models/product.model";

const getProductList: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
    console.log(`getProductList LOG: Input args`, event);

    try {
        const products = await productService.getProducts();
        const stocks = await stockService.getStocks();
        const productList = products.map(product => {
            return {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                count: stocks[product.id]?.count ?? 0
            } as Product
        });

        return formatJSONResponse(productList);
    } catch (err) {
        console.error(`getProductList ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500)
    }
};

export const main = middyfy(getProductList);
