const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,PATCH"
    };

    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const chatId = event.pathParameters.chatId;
        const body = JSON.parse(event.body);

        const command = new UpdateCommand({
            TableName: "infinity-chats",
            Key: { userId, chatId },
            UpdateExpression: "set title = :title",
            ExpressionAttributeValues: {
                ":title": body.title
            },
            ReturnValues: "ALL_NEW"
        });

        const response = await docClient.send(command);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ chat: response.Attributes })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to update chat title", error: error.message })
        };
    }
};
