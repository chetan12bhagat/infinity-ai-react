const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, QueryCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,DELETE"
    };

    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const chatId = event.pathParameters.chatId;

        // 1. Delete chat from infinity-chats
        await docClient.send(new DeleteCommand({
            TableName: "infinity-chats",
            Key: { userId, chatId }
        }));

        // 2. Delete all messages from infinity-messages for this chatId
        // First get all message IDs
        const messages = await docClient.send(new QueryCommand({
            TableName: "infinity-messages",
            KeyConditionExpression: "chatId = :chatId",
            ExpressionAttributeValues: { ":chatId": chatId }
        }));

        if (messages.Items && messages.Items.length > 0) {
            // DynamoDB BatchWrite permits up to 25 items
            const chunks = [];
            for (let i = 0; i < messages.Items.length; i += 25) {
                chunks.push(messages.Items.slice(i, i + 25));
            }

            for (const chunk of chunks) {
                const deleteRequests = chunk.map(msg => ({
                    DeleteRequest: {
                        Key: { chatId, messageId: msg.messageId }
                    }
                }));

                await docClient.send(new BatchWriteCommand({
                    RequestItems: {
                        "infinity-messages": deleteRequests
                    }
                }));
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Chat and messages deleted successfully" })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to delete chat", error: error.message })
        };
    }
};
