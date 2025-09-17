import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";
import { calculateCapacity, calculateTotalPrice, calculateHotelCapacity } from "../../utils/bookingLogic.mjs";

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.id;
    if (!bookingId) {
      return sendResponse(400, {error: "Missing bookingId"})
    }

    const { guests, rooms, checkIn, checkOut } = JSON.parse(event.body);
    if (!guests || guests < 1 || !rooms || !checkIn || !checkOut) {
      return sendResponse(400, {
        error: "Number of guests, rooms, check-in or check-out date missing",
      });
    }

    const filteredRooms = rooms.filter(r => r.count > 0);

    const capacity = calculateCapacity(filteredRooms);
    if (capacity < guests) {
      return sendResponse(400, {
        error: "Selected rooms cannot accommodate all guests",
      });
    };

    const isFull = await calculateHotelCapacity(filteredRooms, checkIn, checkOut);
    if(isFull) return sendResponse(400, { error: "Hotel is fully booked" });

    const totalPrice = calculateTotalPrice(filteredRooms);
    const modifiedAt = new Date().toISOString();

    const command = new UpdateItemCommand({
      TableName: "BonzaiBookings",
      Key: {
        bookingId: { S: bookingId },
      },
      UpdateExpression:
        "SET guests = :guests, rooms = :rooms, checkIn = :checkIn, checkOut = :checkOut, totalPrice = :totalPrice, modifiedAt = :modifiedAt",
      ConditionExpression: "attribute_exists(bookingId)",
      ExpressionAttributeValues: {
        ":guests": { N: guests.toString() },
        ":rooms": { S: JSON.stringify(filteredRooms) },
        ":checkIn": { S: checkIn },
        ":checkOut": { S: checkOut },
        ":totalPrice": { N: totalPrice.toString() },
        ":modifiedAt": { S: modifiedAt },
      },
      ReturnValues: "ALL_NEW",
    });

    await client.send(command);
    return sendResponse(200, {
      bookingId,
      guests,
      rooms: filteredRooms,
      checkIn,
      checkOut,
      totalPrice,
      modifiedAt,
    });

  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return sendResponse(404, { error: "Booking not found" });
    }
    console.error("Update error: ", error);
    return sendResponse(500, { error: "Could not update booking" });
  }
};
