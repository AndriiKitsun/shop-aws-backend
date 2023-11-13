import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { SQSEvent, Handler } from "aws-lambda";
import { DynamoProduct } from "@models/product.model";
import { randomUUID } from "crypto";
import { DynamoStock } from "@models/stock.model";
import productService from "@services/product.service";
import stockService from "@services/stock.service";
import productSnsService from "@services/product-sns.service";


const catalogBatchProcess: Handler = async (event: SQSEvent) => {
    console.log(`catalogBatchProcess LOG: Input args`, event);

    const listOfProducts: DynamoProduct[] = [];
    const listOfStocks: DynamoStock[] = [];

    try {
        for (const record of event.Records) {
            const body = JSON.parse(record.body);

            const product = getProductPayload(body);
            const stock = getStockPayload(product, body);


            if (!isValidPayload(product)) {
                continue;
            }

            listOfProducts.push(product);
            listOfStocks.push(stock);

            await productService.createProduct(product);
            await stockService.createStockItem(stock);
        }

        await productSnsService.publishMessage({
            message: "Created list of products",
            listOfProducts,
            listOfStocks
        })

        return formatJSONResponse();
    } catch (err) {
        console.error(`catalogBatchProcess ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);
    }
};

export function getProductPayload(body: any): DynamoProduct {
    return {
        id: randomUUID(),
        title: body?.title,
        description: body?.description,
        price: body?.price
    };
}

export function getStockPayload(product: DynamoProduct, body: any): DynamoStock {
    return {
        product_id: product.id,
        count: body?.count
    };
}

export function isValidPayload(product: DynamoProduct): boolean {
    return !!product.title;
}

export const main = catalogBatchProcess;
