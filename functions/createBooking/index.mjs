import { sendResponse } from "../../utils/responses/index.mjs";
import { client } from "../../services/db.mjs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../../utils/generateId.mjs";

export const handler = async (event) => {
  try {
    const { guests, rooms, checkIn, checkOut, name, email } = JSON.parse(
      event.body
    );

    // Basic validations
    if (!name || !email) {
      return sendResponse(400, { error: "Name or email missing" });
    }
    if (!rooms || rooms.length === 0) {
      return sendResponse(400, { error: "At least one room must be selected" });
    }

    // Calculate total capacity
    const capacity = rooms.reduce((sum, r) => {
      if (r.type === "single") return sum + r.count * 1;
      if (r.type === "double") return sum + r.count * 2;
      if (r.type === "suite") return sum + r.count * 3;
      return sum;
    }, 0);

    if (capacity < guests) {
      return sendResponse(400, {
        error: "Selected rooms cannot accommodate all guests",
      });
    }

    // Calculate total price
    const totalPrice = rooms.reduce((sum, r) => {
      if (r.type === "single") return sum + r.count * 500;
      if (r.type === "double") return sum + r.count * 1000;
      if (r.type === "suite") return sum + r.count * 1500;
      return sum;
    }, 0);

    // Create booking object
    const bookingId = generateId();
    const newBooking = {
      bookingId: { S: bookingId },
      guests: { N: String(guests) },
      rooms: { S: JSON.stringify(rooms) }, // we save as JSON string
      checkIn: { S: checkIn || "" },
      checkOut: { S: checkOut || "" },
      name: { S: name },
      email: { S: email },
      total: { N: String(totalPrice) },
      createdAt: { S: new Date().toISOString() },
      entityType: { S: "BOOKING" }
    };

    // Save to DynamoDB
    const command = new PutItemCommand({
      TableName: "BonzaiBookings",
      Item: newBooking,
    });
    await client.send(command);

    // Final answer
    return sendResponse(201, {
      bookingId,
      guests,
      rooms,
      checkIn,
      checkOut,
      name,
      email,
      total: totalPrice,
    });
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};
