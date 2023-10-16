export interface DynamoStock {
    product_id: string;
    count: number;
}

export type DynamoNormalizedStock = Record<string, DynamoStock>;
