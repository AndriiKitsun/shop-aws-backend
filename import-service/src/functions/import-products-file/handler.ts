import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { HttpError } from "@libs/http-error";
import s3Service from "@services/s3.service";

export const importProductsFile: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
    console.log(`importProductsFile LOG: Input args`, event);

    try {
        validateInputEvent(event);
        const { name } = event.queryStringParameters;
        const filePath = `uploaded/${name}`;

        const url = await s3Service.getPresignedUrl(filePath);

        return formatJSONResponse(url);
    } catch (err) {
        console.error(`importProductsFile ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);
    }
}

function validateInputEvent(event: any): void {
    const fileName: string = event?.queryStringParameters?.name;

    if (!fileName) {
        throw new HttpError("The 'name' query param is required for import CSV files", 400);
    }

    if (!fileName.endsWith('.csv')) {
        throw new HttpError("Only '.csv' file format is supported", 400);
    }
}


export const main = middyfy(importProductsFile);
