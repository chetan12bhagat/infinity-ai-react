const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    };

    try {
        const chatId = event.pathParameters.chatId;

        const command = new QueryCommand({
            TableName: "infinity-messages",
            KeyConditionExpression: "chatId = :chatId",
            ExpressionAttributeValues: {
                ":chatId": chatId
            },
            ScanIndexForward: true // Oldest first (chronological)
        });

        const response = await docClient.send(command);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ messages: response.Items })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to get messages", error: error.message })
        };
    }
};
