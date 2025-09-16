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
        bookingId: { S: bookingId },
      },
    });

    const result = await client.send(command);

    if (!result.Item) {
      return sendResponse(404, { error: "Booking not found" });
    }

    // Parse data from DynamoDB format
    const booking = {
      bookingId: result.Item.id.S,
      guests: parseInt(result.Item.guests.N, 10),
      rooms: JSON.parse(result.Item.rooms.S),
      checkIn: result.Item.checkIn.S,
      checkOut: result.Item.checkOut.S,
      name: result.Item.name.S,
      email: result.Item.email.S,
      total: parseInt(result.Item.total.N, 10),
      createdAt: result.Item.createdAt.S,
    };

    // Return the booking details
    return sendResponse(200, booking);
  } catch (error) {
    console.error("Error in getBooking:", error);
    return sendResponse(500, { error: "Internal server error" });
  }
};
