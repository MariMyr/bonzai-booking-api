import { sendResponse } from "../../utils/responses/index.mjs";
import { client } from "../../services/db.mjs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../../utils/generateId.mjs";
import { calculateCapacity, calculateHotelCapacity, calculateTotalPrice, isValidDate } from "../../utils/bookingLogic.mjs";

export const handler = async (event) => {
  try {
    const { guests, rooms, checkIn, checkOut, name, email } = JSON.parse(
      event.body
    );

    // Basic validations
    if (!guests || guests < 1) {
      return sendResponse(400, { error: "Number of guests must be at least 1" });
    }
    if (!rooms || rooms.length === 0) {
      return sendResponse(400, { error: "At least one room must be selected" });
    }
    if (!checkIn || !checkOut) {
      return sendResponse(400, { error: "Check-in and check-out dates are required" });
    }
    if(!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return sendResponse(400, { error: "Both checkin and checkout date needs to be in yyyy-mm-dd format" })
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return sendResponse(400, { error: "Check-out date must be after check-in date" });
    }
    if (!name || !email) {
      return sendResponse(400, { error: "Name and email are required" });
    }

    const filteredRooms = rooms.filter(r => r.count > 0);

    // Calculate total capacity
    const capacity = calculateCapacity(filteredRooms);
    if (capacity < guests) {
      return sendResponse(400, { error: "Selected rooms cannot accomodate all guests" });
    }

    //Calculate hotel capacity
    const isFull = await calculateHotelCapacity(filteredRooms, checkIn, checkOut);
    
    if(isFull) return sendResponse(400, { error: "Hotel is fully booked" });

    // Calculate total price
    const totalPrice = calculateTotalPrice(filteredRooms);

    // Create booking object
    const bookingId = generateId();
    const createdAt = new Date().toISOString();

    const newBooking = {
      bookingId: { S: bookingId },
      guests: { N: String(guests) },
      rooms: { S: JSON.stringify(filteredRooms) }, // we save as JSON string
      checkIn: { S: checkIn },
      checkOut: { S: checkOut },
      name: { S: name },
      email: { S: email },
      totalPrice: { N: totalPrice.toString() },
      createdAt: { S: createdAt },
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
      rooms: filteredRooms,
      checkIn,
      checkOut,
      name,
      email,
      totalPrice,
      createdAt,
    });
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};

