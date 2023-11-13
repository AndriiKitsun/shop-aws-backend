import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import middy from "@middy/core";
import { S3Event } from "aws-lambda/trigger/s3";
import s3Service from "@services/s3.service";
import { Transform } from "stream";
import productSqsService from "@services/product-sqs.service";

const importFileParser = async (event: S3Event) => {
    console.log(`importFileParser LOG: Input args:`, event);

    try {
        for (const record of event.Records) {
            console.log(`importFileParser LOG: S3 Event Record:`, record.s3);

            const filePath = record.s3.object.key;
            const file = await s3Service.getCsvFile(filePath);

            console.log(`importFileParser LOG: Sending to SQS:`, filePath);
            const parsingResult = await handleCsvFile(file);
            console.log(`importFileParser LOG: Sent to SQS`, parsingResult);

            console.log(`importFileParser LOG: Moving to 'parsed' directory`, filePath);
            await moveParsedFile(filePath)
            console.log(`importFileParser LOG: Moved to 'parsed' directory`);
        }

        return formatJSONResponse();
    } catch (err) {
        console.error(`importFileParser ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';

        return formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);
    }
}


function handleCsvFile(fileStream: Transform): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let dataChunks: Record<string, string>[] = [];

        fileStream
            .on('data', data => {
                dataChunks.push(data);
            })
            .on('error', error => {
                reject(error);
            })
            .on('end', async () => {
                for (const data of dataChunks) {
                    await productSqsService.sendMessage(data);
                }

                resolve(true);
            });
    });
}

async function moveParsedFile(filePath: string): Promise<void> {
    const destinationPath = filePath.replace('uploaded', 'parsed');

    await s3Service.moveFile(filePath, destinationPath);
}

export const main = middy(importFileParser);
