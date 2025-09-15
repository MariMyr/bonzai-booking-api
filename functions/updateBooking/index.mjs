import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {
    const bookingId = event.pathParameters?.id;

    const { guests, rooms, checkIn, checkOut } = JSON.parse(event.body);

    if (!guests || !rooms || !checkIn || !checkOut) {
        return sendResponse(400, {error: "Number of guests, rooms, check-in or check-out date missing"})
    }

    // const validation = validateBooking(guests, rooms);  har vi/ska vi skapa en validateBooking-funktion vi kan använda här också?

    const command = new UpdateItemCommand({
        TableName: "BonzaiBookings",
        Key: {
            bookingId: {S: bookingId }
        },
        UpdateExpression: "",
        ExpressionAttributeValues: "",
        ConditionExpression: ""
    });
};