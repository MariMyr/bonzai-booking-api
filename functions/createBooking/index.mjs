import { sendResponse } from "../../utils/responses/index.mjs";
import { client } from "../../services/db.mjs";
import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../../utils/generateId.mjs";
import { calculateCapacity, calculateTotalPrice } from "../../utils/bookingLogic.mjs";

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
    if (new Date(checkOut) <= new Date(checkIn)) {
      return sendResponse(400, { error: "Check-out date must be after check-in date" });
    }
    if (!name || !email) {
      return sendResponse(400, { error: "Name and email are required" });
    }

    // Calculate total capacity
    const capacity = calculateCapacity(rooms);
    if (capacity < guests) {
      return sendResponse(400, { error: "Selected rooms cannot accomodate all guests" });
    }

    //Calculate hotel capacity
    const requestedRooms = rooms.reduce((sum, r) => sum + r.count, 0);

    const existingBookings = await client.send(
      new QueryCommand({
        TableName: "BonzaiBookings",
        IndexName: "entityIndex",
        KeyConditionExpression: "entityType = :etype AND checkIn >= :from",
        ExpressionAttributeValues: {
        ":etype": { S: "BOOKING" },
        ":from": { S: "2000-01-01T00:00:00.000Z" }
        }
      })
    );

    let bookedRooms = 0;
    for(const item of existingBookings.Items) {
      const booked = JSON.parse(item.rooms.S);
      bookedRooms += booked.reduce((sum, r) => sum + r.count, 0)
    };

    if(bookedRooms + requestedRooms > 20){
      return sendResponse(400, {error: "Hotel is fully booked"})
    };

    // Calculate total price
    const totalPrice = calculateTotalPrice(rooms);

    // Create booking object
    const bookingId = generateId();
    const createdAt = new Date().toISOString();

    const newBooking = {
      bookingId: { S: bookingId },
      guests: { N: String(guests) },
      rooms: { S: JSON.stringify(rooms) }, // we save as JSON string
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
      rooms,
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

