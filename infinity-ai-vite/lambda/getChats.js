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
        const userId = event.requestContext.authorizer.claims.sub;

        const command = new QueryCommand({
            TableName: "infinity-chats",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            },
            ScanIndexForward: false // Newest first
        });

        const response = await docClient.send(command);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ chats: response.Items })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Failed to get chats", error: error.message })
        };
    }
};
