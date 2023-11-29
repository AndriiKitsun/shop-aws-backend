import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { Handler } from "aws-lambda";
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda/trigger/api-gateway-authorizer";

const basicAuthorizer: Handler = async (event: APIGatewayTokenAuthorizerEvent, _context, callback) => {
    console.log(`basicAuthorizer LOG: Input args`, event);

    try {
        const rawToken = event.authorizationToken.split(' ')[1];

        if (!rawToken) {
            return callback('Unauthorized');
        }

        const userCreds = Buffer.from(rawToken, 'base64').toString('ascii');
        const adminCreds = `${process.env.ADMIN_LOGIN}:${process.env.ADMIN_PASSWORD}`;
        const isUserAllowed = userCreds === adminCreds;
        const authPolicy = getPolicy(rawToken, event.methodArn, isUserAllowed);

        return callback(null, authPolicy);
    } catch (err) {
        console.error(`basicAuthorizer ERR:`, err);

        const errorMessage = err?.errorMessage ?? err?.message ?? 'Internal server error';
        const error = formatJSONResponse(errorResponse(errorMessage), err?.status ?? 500);

        return callback(errorMessage, error);
    }
};

function getPolicy(principalId: string, resource: string, allow: boolean): APIGatewayAuthorizerResult {
    const effect = allow ? 'Allow' : "Deny";

    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    }
}

export const main = basicAuthorizer;
