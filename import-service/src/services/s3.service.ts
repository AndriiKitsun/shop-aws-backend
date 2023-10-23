import { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StreamingBlobPayloadOutputTypes } from "@smithy/types/dist-types/streaming-payload/streaming-blob-payload-output-types";
import csv from "csv-parser";
import { Transform } from 'stream';

export class S3Service {
    public readonly client: S3Client;
    private bucketName = process.env.IMPORT_FILE_STORAGE_NAME;

    constructor() {
        this.client = new S3Client({
            region: process.env.PROVIDER_REGION,
        });
    }

    public getPresignedUrl(filePath: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: filePath
        });

        return getSignedUrl(this.client, command, {
            expiresIn: 3600
        });
    }

    public async getCsvFile(filePath: string): Promise<Transform> {
        const file = await this.getRawFile(filePath);

        return file
            .pipe(csv());
    }

    public async moveFile(filePath: string, destinationPath: string): Promise<void> {
        const copyCommand = new CopyObjectCommand({
            Bucket: this.bucketName,
            Key: destinationPath,
            CopySource: `${this.bucketName}/${filePath}`
        });

        const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: filePath,
        });

        await this.client.send(copyCommand);
        await this.client.send(deleteCommand);
    }

    private async getRawFile(filePath: string): Promise<StreamingBlobPayloadOutputTypes> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: filePath
        });

        const response = await this.client.send(command);

        return response.Body;
    }
}

export default new S3Service()
