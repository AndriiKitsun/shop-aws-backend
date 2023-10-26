import { handlerPath } from "@libs/handler-resolver";
import { configDotenv } from "dotenv";

configDotenv();

export default {
    name: "importFileParser",
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            s3: {
                bucket: process.env.IMPORT_FILE_STORAGE_NAME,
                event: 's3:ObjectCreated:*',
                rules: [
                    {
                        prefix: 'uploaded/'
                    }
                ],
                existing: true
            }
        },
    ],
};
