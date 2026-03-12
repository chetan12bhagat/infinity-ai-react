const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };

    try {
        const body = JSON.parse(event.body);
        const userId = event.requestContext.authorizer.claims.sub;
        const chatId = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const title = body.title || "New Chat";

        const command = new PutCommand({
            TableName: "infinity-chats",
            Item: {
                userId,
                chatId,
                title,
                createdAt
            }
        });

        await docClient.send(command);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ chatId, title, createdAt })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to create chat", error: error.message })
        };
    }
};
