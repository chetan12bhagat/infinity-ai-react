const { CognitoIdentityProviderClient, CreateUserPoolCommand, CreateUserPoolClientCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { LambdaClient, CreateFunctionCommand, AddPermissionCommand } = require("@aws-sdk/client-lambda");
const { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, GetRoleCommand } = require("@aws-sdk/client-iam");
const { APIGatewayClient, CreateRestApiCommand, GetResourcesCommand, CreateResourceCommand, PutMethodCommand, PutIntegrationCommand, CreateDeploymentCommand, PutMethodResponseCommand, PutIntegrationResponseCommand } = require("@aws-sdk/client-api-gateway");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const REGION = "us-east-1";
const LAMBDA_DIR = path.join(__dirname, "lambda");
const ROLE_NAME = "infinity-ai-lambda-role";

const cognitoclient = new CognitoIdentityProviderClient({ region: REGION });
const lambdaclient = new LambdaClient({ region: REGION });
const iamclient = new IAMClient({ region: REGION });
const apiclient = new APIGatewayClient({ region: REGION });

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("🚀 Starting Infinity AI AWS Auto-Setup...");

    try {
        // 1. Create Cognito User Pool
        console.log("🔐 Creating Cognito User Pool...");
        const userPoolResponse = await cognitoclient.send(new CreateUserPoolCommand({
            PoolName: "infinity-ai-users",
            AutoVerifiedAttributes: ["email"],
            UsernameAttributes: ["email"],
            Schema: [
                { Name: "email", AttributeDataType: "String", Required: true, Mutable: true },
                { Name: "name", AttributeDataType: "String", Required: false, Mutable: true }
            ],
            Policies: {
                PasswordPolicy: {
                    MinimumLength: 8,
                    RequireUppercase: true,
                    RequireLowercase: true,
                    RequireNumbers: true,
                    RequireSymbols: false
                }
            }
        }));
        const userPoolId = userPoolResponse.UserPool.Id;
        console.log(`✅ User Pool Created: ${userPoolId}`);

        // 2. Create User Pool Client
        const clientResponse = await cognitoclient.send(new CreateUserPoolClientCommand({
            UserPoolId: userPoolId,
            ClientName: "infinity-client",
            ExplicitAuthFlows: ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"],
            GenerateSecret: false,
            CallbackURLs: ["http://localhost:5173"]
        }));
        const clientId = clientResponse.UserPoolClient.ClientId;
        console.log(`✅ App Client Created: ${clientId}`);

        // 3. Create IAM Role for Lambdas
        console.log("🛡️ Creating IAM Role for Lambdas...");
        const trustPolicy = {
            Version: "2012-10-17",
            Statement: [{
                Effect: "Allow",
                Principal: { Service: "lambda.amazonaws.com" },
                Action: "sts:AssumeRole"
            }]
        };

        let roleArn;
        try {
            const roleResponse = await iamclient.send(new CreateRoleCommand({
                RoleName: ROLE_NAME,
                AssumeRolePolicyDocument: JSON.stringify(trustPolicy)
            }));
            roleArn = roleResponse.Role.Arn;
        } catch (e) {
            if (e.name === "EntityAlreadyExists") {
                const getRole = await iamclient.send(new GetRoleCommand({ RoleName: ROLE_NAME }));
                roleArn = getRole.Role.Arn;
            } else throw e;
        }

        await iamclient.send(new AttachRolePolicyCommand({
            RoleName: ROLE_NAME,
            PolicyArn: "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
        }));
        await iamclient.send(new AttachRolePolicyCommand({
            RoleName: ROLE_NAME,
            PolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        }));

        console.log("⏳ Waiting for IAM Role to propagate...");
        await sleep(10000); // Wait for role propagation

        // 4. Create Lambdas
        console.log("⚡ Provisioning Lambda Functions...");
        const lambdas = [
            { name: "infinity-createChat", file: "createChat.js" },
            { name: "infinity-getChats", file: "getChats.js" },
            { name: "infinity-saveMessage", file: "saveMessage.js" },
            { name: "infinity-getMessages", file: "getMessages.js" },
            { name: "infinity-deleteChat", file: "deleteChat.js" },
            { name: "infinity-updateChatTitle", file: "updateChatTitle.js" }
        ];

        const lambdaArns = {};

        for (const l of lambdas) {
            const zip = new AdmZip();
            zip.addLocalFile(path.join(LAMBDA_DIR, l.file));
            const zipBuffer = zip.toBuffer();

            const createFunc = await lambdaclient.send(new CreateFunctionCommand({
                FunctionName: l.name,
                Runtime: "nodejs20.x",
                Role: roleArn,
                Handler: `${l.file.split(".")[0]}.handler`,
                Code: { ZipFile: zipBuffer },
                Timeout: 30
            }));
            lambdaArns[l.name] = createFunc.FunctionArn;
            console.log(`   - ${l.name} created.`);
        }

        // 5. Create API Gateway
        console.log("🌐 Setting up API Gateway...");
        const apiResponse = await apiclient.send(new CreateRestApiCommand({
            Name: "infinity-ai-api",
            Description: "API for Infinity AI Chat App"
        }));
        const apiId = apiResponse.id;

        const resources = await apiclient.send(new GetResourcesCommand({ restApiId: apiId }));
        const rootId = resources.items[0].id;

        // Create /chats
        const chatsResource = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: rootId, pathPart: "chats" }));
        const chatsId = chatsResource.id;

        // Create /chats/{chatId}
        const chatIdVar = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: chatsId, pathPart: "{chatId}" }));
        const chatIdVarId = chatIdVar.id;

        // Create /chats/{chatId}/messages
        const messagesResource = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: chatIdVarId, pathPart: "messages" }));
        const messagesId = messagesResource.id;

        // Function to setup Method + Integration
        const setupMethod = async (resId, httpMethod, lambdaName, isProxy = true) => {
            await apiclient.send(new PutMethodCommand({
                restApiId: apiId, resourceId: resId, httpMethod, authorizationType: "NONE" // Temp, will add authorizer
            }));
            await apiclient.send(new PutIntegrationCommand({
                restApiId: apiId, resourceId: resId, httpMethod,
                type: "AWS_PROXY", integrationHttpMethod: "POST",
                uri: `arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${lambdaArns[lambdaName]}/invocations`
            }));
            // Add Permission for APIG to call Lambda
            await lambdaclient.send(new AddPermissionCommand({
                FunctionName: lambdaName,
                StatementId: `apig-${Date.now()}`,
                Action: "lambda:InvokeFunction",
                Principal: "apigateway.amazonaws.com",
                SourceArn: `arn:aws:execute-api:${REGION}:${roleArn.split(":")[4]}:${apiId}/*`
            }));
        };

        // Setup Routes
        await setupMethod(chatsId, "POST", "infinity-createChat");
        await setupMethod(chatsId, "GET", "infinity-getChats");
        await setupMethod(chatIdVarId, "DELETE", "infinity-deleteChat");
        await setupMethod(chatIdVarId, "PATCH", "infinity-updateChatTitle");
        await setupMethod(messagesId, "POST", "infinity-saveMessage");
        await setupMethod(messagesId, "GET", "infinity-getMessages");

        // 6. Deploy API
        console.log("🚀 Deploying API...");
        await apiclient.send(new CreateDeploymentCommand({ restApiId: apiId, stageName: "prod" }));
        const apiUrl = `https://${apiId}.execute-api.${REGION}.amazonaws.com/prod`;

        console.log("\n✨ AWS SETUP COMPLETE! ✨");
        console.log("-----------------------------------------");
        console.log(`VITE_AWS_REGION=${REGION}`);
        console.log(`VITE_COGNITO_USER_POOL_ID=${userPoolId}`);
        console.log(`VITE_COGNITO_CLIENT_ID=${clientId}`);
        console.log(`VITE_API_GATEWAY_URL=${apiUrl}`);
        console.log("-----------------------------------------");
        console.log("\nUpdating your .env file now...");

        const envContent = `VITE_AWS_REGION=${REGION}
VITE_COGNITO_USER_POOL_ID=${userPoolId}
VITE_COGNITO_CLIENT_ID=${clientId}
VITE_API_GATEWAY_URL=${apiUrl}
`;
        fs.writeFileSync(path.join(__dirname, ".env"), envContent);
        console.log("✅ .env file updated successfully!");

    } catch (error) {
        console.error("❌ Setup Failed:", error);
    }
}

run();
