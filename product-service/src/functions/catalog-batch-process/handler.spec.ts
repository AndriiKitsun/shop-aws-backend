import { SQSEvent } from "aws-lambda";
import { main as catalogBatchProcess, getProductPayload, getStockPayload, isValidPayload } from "./handler";
import productService from "@services/product.service";
import stockService from "@services/stock.service";
import productSnsService from "@services/product-sns.service";
import * as crypto from "crypto";
import { DynamoProduct } from "@models/product.model";

describe('catalogBatchProcess handler', () => {

    describe('catalogBatchProcess', () => {
        let createProductSpy: jest.SpyInstance;
        let createStockItemSpy: jest.SpyInstance;
        let publishMessageSpy: jest.SpyInstance;

        const mockSqsEvent = {
            Records: [
                {
                    body: '{"title":"Wood Bread and Pastry Knife","description":"Ergonomic Knife with Wavy Edge","price":"45.99","count":"8"}',
                }
            ]
        } as SQSEvent;

        beforeEach(() => {
            createProductSpy = jest.spyOn(productService, 'createProduct').mockResolvedValue();
            createStockItemSpy = jest.spyOn(stockService, 'createStockItem').mockResolvedValue();
            publishMessageSpy = jest.spyOn(productSnsService, 'publishMessage').mockResolvedValue(null);
        });

        it('should not create product and stock when body is not valid', async () => {
            const mockSqsEvent = {
                Records: [
                    {
                        body: '{"title":"","description":"Ergonomic Knife with Wavy Edge","price":"45.99","count":"8"}',
                    }
                ]
            } as SQSEvent;

            await catalogBatchProcess(mockSqsEvent, null, null);


            expect(createProductSpy).not.toHaveBeenCalled();
            expect(createStockItemSpy).not.toHaveBeenCalled();
        });

        it('should create product with correct params', async () => {
            jest.spyOn(crypto, 'randomUUID').mockReturnValue('6b5d43d0-8f47-40cd-8a86-f6cfa80c8014');

            const productPayload = {
                id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: "45.99",
            };

            await catalogBatchProcess(mockSqsEvent, null, null);

            expect(createProductSpy).toHaveBeenCalledWith(productPayload);
        });

        it('should create stock with correct params', async () => {
            jest.spyOn(crypto, 'randomUUID').mockReturnValue('6b5d43d0-8f47-40cd-8a86-f6cfa80c8014');

            const stockPayload = {
                product_id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                count: "8"
            }

            await catalogBatchProcess(mockSqsEvent, null, null);

            expect(createStockItemSpy).toHaveBeenCalledWith(stockPayload);
        });

        it('should publish a message to SNS', async () => {
            jest.spyOn(crypto, 'randomUUID').mockReturnValue('6b5d43d0-8f47-40cd-8a86-f6cfa80c8014');

            const expectedArgs = {
                message: "Created list of products",
                listOfProducts: [
                    {
                        id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                        title: "Wood Bread and Pastry Knife",
                        description: "Ergonomic Knife with Wavy Edge",
                        price: "45.99",
                    }
                ],
                listOfStocks: [
                    {
                        product_id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                        count: "8"
                    }
                ]
            };

            await catalogBatchProcess(mockSqsEvent, null, null);

            expect(publishMessageSpy).toHaveBeenCalledWith(expectedArgs);
        });
    });


    describe('getProductPayload', () => {
        it('should return payload for product', () => {
            jest.spyOn(crypto, 'randomUUID').mockReturnValue('6b5d43d0-8f47-40cd-8a86-f6cfa80c8014');

            const body = {
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: "45.99",
                count: "8"
            };
            const expectedPayload = {
                id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: "45.99",
            }

            const payload = getProductPayload(body);

            expect(payload).toStrictEqual(expectedPayload)
        });
    });


    describe('getStockPayload', () => {
        it('should return payload for stock', () => {
            const productPayload: DynamoProduct = {
                id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: 45.99,
            }
            const body = {
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: "45.99",
                count: "8"
            };

            const expectedPayload = {
                product_id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                count: "8"
            }

            const payload = getStockPayload(productPayload, body);

            expect(payload).toStrictEqual(expectedPayload)
        });
    });

    describe('isValidPayload', () => {
        it('should return false when product does not contain title', () => {
            const productPayload: DynamoProduct = {
                id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                title: "",
                description: "Ergonomic Knife with Wavy Edge",
                price: 45.99,
            }

            const result = isValidPayload(productPayload);

            expect(result).toBe(false)
        });

        it('should return true when product contains required title', () => {
            const productPayload: DynamoProduct = {
                id: "6b5d43d0-8f47-40cd-8a86-f6cfa80c8014",
                title: "Wood Bread and Pastry Knife",
                description: "Ergonomic Knife with Wavy Edge",
                price: 45.99,
            }

            const result = isValidPayload(productPayload);

            expect(result).toBe(true)
        });
    });


});
