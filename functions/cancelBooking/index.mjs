import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {
    try {
        const bookingId = event.pathParameters?.id;

        if (!bookingId) {
            return sendResponse(400, {error: "Missing bookingId"})
        }

        const command = new DeleteItemCommand({
            TableName: "BonzaiBookings",
            Key: {
                bookingId: { S: bookingId},
            }
        });

        await client.send(command);

        return sendResponse(200, { message: `Booking ${bookingId} cancelled successfully` });

    } catch (error) {
        return sendResponse(500, {error: "Could not cancel booking"})
    }

};