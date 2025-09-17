import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../services/db.mjs";

// Calculate total capacity
export function calculateCapacity(rooms) {
  return rooms.reduce((sum, r) => {
    if (r.type === "single") return sum + r.count * 1;
    if (r.type === "double") return sum + r.count * 2;
    if (r.type === "suite") return sum + r.count * 3;
    return sum;
  }, 0);
}

// Calculate total price
export function calculateTotalPrice(rooms) {
  return rooms.reduce((sum, r) => {
    if (r.type === "single") return sum + r.count * 500;
    if (r.type === "double") return sum + r.count * 1000;
    if (r.type === "suite") return sum + r.count * 1500;
    return sum;
  }, 0);
}

//Calculate hotel capacity

export async function calculateHotelCapacity(rooms, checkIn, checkOut) {
  const requestedRooms = rooms.reduce((sum, r) => sum + r.count, 0);

  const existingBookings = await client.send(
    new QueryCommand({
      TableName: "BonzaiBookings",
      IndexName: "entityIndex",
      KeyConditionExpression: "entityType = :etype AND checkIn < :newCheckOut",
      ExpressionAttributeValues: {
      ":etype": { S: "BOOKING" },
      ":newCheckOut": { S: checkOut }
      }
    })
  );

  const newCheckInDate = new Date(checkIn);

  let bookedRooms = 0;
  for(const item of existingBookings.Items) {
    const existingCheckOut = new Date(item.checkOut.S)

    if(existingCheckOut > newCheckInDate) {
      const booked = JSON.parse(item.rooms.S);
      bookedRooms += booked.reduce((sum, r) => sum + r.count, 0)
    }
  };

  return bookedRooms + requestedRooms > 20
}

//validate date-format
export function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if(!regex.test(dateString)) return false;

const date = new Date(dateString);
return date instanceof Date && !isNaN(date) &&
        date.toISOString().slice(0, 10) === dateString;
}


