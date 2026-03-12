const { LambdaClient, ListFunctionsCommand, AddPermissionCommand } = require('@aws-sdk/client-lambda');
const { APIGatewayClient, CreateRestApiCommand, GetResourcesCommand, CreateResourceCommand, PutMethodCommand, PutIntegrationCommand, CreateDeploymentCommand } = require('@aws-sdk/client-api-gateway');

const REGION = 'us-east-1';

const lambdaclient = new LambdaClient({ region: REGION });
const apiclient = new APIGatewayClient({ region: REGION });

async function run() {
    try {
        console.log('Retrieving existing Lambdas...');
        const lambdaRes = await lambdaclient.send(new ListFunctionsCommand({}));
        const lambdaArns = {};
        for(let l of lambdaRes.Functions) {
            if(l.FunctionName.startsWith('infinity-')) {
                // If there are multiple, grab the one without timestamp or the latest
                // The ones we want are probably: infinity-createChat, infinity-getChats, etc.
                // Looking at logs, in the first attempt they were created as 'infinity-createChat' WITHOUT timestamp
                if(!l.FunctionName.match(/\d{10,}$/)) { 
                    lambdaArns[l.FunctionName] = l.FunctionArn;
                }
            }
        }
        
        console.log("Found Lambdas:", JSON.stringify(Object.keys(lambdaArns)));

        console.log('🌐 Setting up API Gateway...');
        const apiName = 'infinity-ai-api-' + Date.now();
        const apiResponse = await apiclient.send(new CreateRestApiCommand({ name: apiName, description: 'Infinity AI API' }));
        const apiId = apiResponse.id;
        
        console.log('Getting resources...');
        const resources = await apiclient.send(new GetResourcesCommand({ restApiId: apiId }));
        const rootId = resources.items[0].id;

        console.log('Creating routes...');
        const chatsResource = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: rootId, pathPart: 'chats' }));
        const chatsId = chatsResource.id;
        const chatIdVar = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: chatsId, pathPart: '{chatId}' }));
        const chatIdVarId = chatIdVar.id;
        const messagesResource = await apiclient.send(new CreateResourceCommand({ restApiId: apiId, parentId: chatIdVarId, pathPart: 'messages' }));
        const messagesId = messagesResource.id;

        const setupMethod = async (resId, httpMethod, lambdaName) => {
            console.log('Setting up ' + httpMethod + ' for ' + lambdaName);
            await apiclient.send(new PutMethodCommand({ restApiId: apiId, resourceId: resId, httpMethod, authorizationType: 'NONE' }));
            const proxyUri = 'arn:aws:apigateway:' + REGION + ':lambda:path/2015-03-31/functions/' + lambdaArns[lambdaName] + '/invocations';
            await apiclient.send(new PutIntegrationCommand({
                restApiId: apiId, resourceId: resId, httpMethod, type: 'AWS_PROXY', integrationHttpMethod: 'POST',
                uri: proxyUri
            }));
            const actualLambdaName = lambdaArns[lambdaName].split(':').pop();
            const sourceArn = 'arn:aws:execute-api:' + REGION + ':372666940130:' + apiId + '/*'; // Using hardcoded account ID from earlier output
            await lambdaclient.send(new AddPermissionCommand({
                FunctionName: actualLambdaName, StatementId: 'apig-' + Math.floor(Math.random() * 1000000), Action: 'lambda:InvokeFunction',
                Principal: 'apigateway.amazonaws.com', SourceArn: sourceArn
            })).catch(() => console.log('Permission exists for', lambdaName)); // Ignore if already added
        };

        await setupMethod(chatsId, 'POST', 'infinity-createChat');
        await setupMethod(chatsId, 'GET', 'infinity-getChats');
        await setupMethod(chatIdVarId, 'DELETE', 'infinity-deleteChat');
        await setupMethod(chatIdVarId, 'PATCH', 'infinity-updateChatTitle');
        await setupMethod(messagesId, 'POST', 'infinity-saveMessage');
        await setupMethod(messagesId, 'GET', 'infinity-getMessages');

        console.log('🚀 Deploying API...');
        await apiclient.send(new CreateDeploymentCommand({ restApiId: apiId, stageName: 'prod' }));
        const apiUrl = 'https://' + apiId + '.execute-api.' + REGION + '.amazonaws.com/prod';

        console.log('\n✨ API GATEWAY URL: ' + apiUrl);
        
        // Update .env file
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/VITE_API_GATEWAY_URL=.*/, 'VITE_API_GATEWAY_URL=' + apiUrl);
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file updated with new API URL.');
        
        // Final log
        fs.writeFileSync('api_url.txt', apiUrl);
    } catch (e) { console.error('Error in script:', e); }
}
run();
