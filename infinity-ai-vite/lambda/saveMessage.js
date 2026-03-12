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
        const chatId = event.pathParameters.chatId;
        const body = JSON.parse(event.body);
        const messageId = Date.now().toString() + "-" + crypto.randomBytes(4).toString('hex');
        
        const command = new PutCommand({
            TableName: "infinity-messages",
            Item: {
                chatId,
                messageId,
                role: body.role,
                content: body.content,
                timestamp: new Date().toISOString()
            }
        });

        await docClient.send(command);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ messageId, role: body.role, content: body.content })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to save message", error: error.message })
        };
    }
};
