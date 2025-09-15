import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {
    try {
        const bookingId = event.pathParameters?.id;

        if (!bookingId) {
            return sendResponse(400, { error: "Missing bookingId" });
        }
        const command = new GetItemCommand({
            TableName: "BonzaiBookings",
            Key: {
                id: { S: bookingId },
            },
        });

        const result = await client.send(command);

        if (!result.Item) {
            return sendResponse(404, { error: "Booking not found" });
        }
    }
   
};
