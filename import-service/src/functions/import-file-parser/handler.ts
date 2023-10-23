import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import middy from "@middy/core";
import { S3Event } from "aws-lambda/trigger/s3";
import s3Service from "@services/s3.service";
import { Transform } from "stream";

const importFileParser = async (event: S3Event) => {
    console.log(`importFileParser LOG: Input args:`, event);

    try {
        for (const record of event.Records) {
            console.log(`importFileParser LOG: S3 Event Record:`, record.s3);

            const filePath = record.s3.object.key;
            const file = await s3Service.getCsvFile(filePath);

            handleCsvFile(filePath, file);
        }

        return formatJSONResponse();
    } catch (err) {
        console.error(`importFileParser ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);
    }
}


function handleCsvFile(filePath: string, fileStream: Transform): void {
    fileStream
        .on('data', data => {
            console.log(`importFileParser LOG: ${filePath} CSV file part data:`, data);
        })
        .on('error', error => {
            console.error(`importFileParser ERR: ${filePath} Error during parsing CSV:`, error);
        })
        .on('end', () => {
            console.log(`importFileParser LOG: ${filePath} CSV parsing finished`);
            moveParsedFile(filePath)
        })
}

async function moveParsedFile(filePath: string): Promise<void> {
    const destinationPath = filePath.replace('uploaded', 'parsed')

    await s3Service.moveFile(filePath, destinationPath)
}

export const main = middy(importFileParser);
