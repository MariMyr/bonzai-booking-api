import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {
  try {
    const from = event.queryStringParameters?.from;
    const to = event.queryStringParameters?.to;

    let conditionKey = "entityType = :etype AND checkIn >= :from";
    const expressionValues = {
      ":etype": { S: "BOOKING" },
      ":from": { S: from || "2000-01-01T00:00:00.000Z" },
    };

    if (to) {
      conditionKey = "entityType = :etype AND checkIn BETWEEN :from AND :to";
      expressionValues[":to"] = { S: to };
    }

    const command = new QueryCommand({
      TableName: "BonzaiBookings",
      IndexName: "entityIndex",
      KeyConditionExpression: conditionKey,
      ExpressionAttributeValues: expressionValues,
      ProjectionExpression: "bookingId, checkIn, checkOut, guests, rooms, #n",
      ExpressionAttributeNames: {
        "#n": "name",
      },
    });

    const result = await client.send(command);

    const bookings = result.Items.map((item) => ({
      bookingId: item.bookingId.S,
      guests: parseInt(item.guests.N, 10),
      rooms: JSON.parse(item.rooms.S),
      checkIn: item.checkIn.S,
      checkOut: item.checkOut.S,
      name: item.name.S,
    }));

    return sendResponse(200, {
      success: true,
      bookings,
    });
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};
