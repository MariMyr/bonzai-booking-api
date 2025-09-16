import { QueryCommand } from "@aws-sdk/client-dynamodb"; 
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {

    const command = new QueryCommand({
        TableName: "BonzaiBookings",
        IndexName: "entityIndex",
        KeyConditionExpression: "entityType = :etype AND createdAt >= :start",
        ExpressionAttributeValues: {
            ":etype": { S: "BOOKING" },
            ":start": { S: "2000-01-01T00:00:00.000Z" }
        },
        ProjectionExpression: "bookingId, checkIn, checkOut, guests, rooms, #n",
        ExpressionAttributeNames: {
            "#n": "name"
        }
    });

    const result = await client.send(command);

    return sendResponse(200, {
        success: true,
        bookings: result.Items
    });
};
