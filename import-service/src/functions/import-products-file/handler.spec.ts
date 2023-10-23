import { importProductsFile } from "@functions/import-products-file/handler";
import s3Service from "@services/s3.service";

describe('importProductsFile', () => {
    it('should return error model when query param is not present', async () => {
        const mockEvent = {
            queryStringParameters: null
        };

        const res = await importProductsFile(mockEvent as any, null, null) as any;
        const body = JSON.parse(res.body);

        expect(res.statusCode).toBe(400);
        expect(body.message).toBe("The 'name' query param is required for import CSV files");
    });

    it('should return error model when query param contains non .csv file', async () => {
        const mockEvent = {
            queryStringParameters: {
                name: "mock_file.json"
            }
        };

        const res = await importProductsFile(mockEvent as any, null, null) as any;
        const body = JSON.parse(res.body);

        expect(res.statusCode).toBe(400);
        expect(body.message).toBe("Only '.csv' file format is supported");
    });

    it('should return presigned url for file', async () => {
        const mockEvent = {
            queryStringParameters: {
                name: "mock_file.csv"
            }
        };
        jest.spyOn(s3Service, 'getPresignedUrl').mockResolvedValue('mock_presigned_url');

        const res = await importProductsFile(mockEvent as any, null, null) as any;
        const body = JSON.parse(res.body);

        expect(res.statusCode).toBe(200);
        expect(body).toBe("mock_presigned_url");
    });
});
