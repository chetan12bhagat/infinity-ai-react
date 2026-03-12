const { APIGatewayClient, CreateAuthorizerCommand, UpdateMethodCommand, GetResourcesCommand, CreateDeploymentCommand } = require("@aws-sdk/client-api-gateway");

const REGION = "us-east-1";
const API_ID = "ufyfjhrigh";
const USER_POOL_ARNS = ["arn:aws:cognito-idp:us-east-1:372666940130:userpool/us-east-1_gzNjm3UXY"];

const apiclient = new APIGatewayClient({ region: REGION });

async function run() {
    try {
        console.log("Creating authorizer...");
        const authRes = await apiclient.send(new CreateAuthorizerCommand({
            restApiId: API_ID,
            name: "cognito-authorizer",
            type: "COGNITO_USER_POOLS",
            providerARNs: USER_POOL_ARNS,
            identitySource: "method.request.header.Authorization"
        }));
        const authorizerId = authRes.id;
        console.log("Authorizer created with ID:", authorizerId);

        console.log("Getting resources...");
        const res = await apiclient.send(new GetResourcesCommand({ restApiId: API_ID }));
        const items = res.items;

        for (const item of items) {
            for (const method of Object.keys(item.resourceMethods || {})) {
                if (method !== 'OPTIONS') { // Don't add authorizer to OPTIONS
                    console.log(`Updating method ${method} for resource ${item.path}`);
                    await apiclient.send(new UpdateMethodCommand({
                        restApiId: API_ID,
                        resourceId: item.id,
                        httpMethod: method,
                        patchOperations: [
                            {
                                op: "replace",
                                path: "/authorizationType",
                                value: "COGNITO_USER_POOLS"
                            },
                            {
                                op: "replace",
                                path: "/authorizerId",
                                value: authorizerId
                            }
                        ]
                    }));
                }
            }
        }

        console.log("Deploying API...");
        await apiclient.send(new CreateDeploymentCommand({
            restApiId: API_ID,
            stageName: "prod"
        }));

        console.log("All done! Authorizer added and API deployed.");
    } catch (e) {
        console.error(e);
    }
}
run();
