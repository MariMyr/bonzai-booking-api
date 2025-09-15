import { sendResponse } from "../../utils/responses/index.mjs";
import { client } from "../../services/db.mjs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { generateId } from "../../utils/generateId.mjs";

export const handler = async (event) => {
    const { guests, rooms, checkIn, checkOut, name, email } = JSON.parse(event.body);

    if(!name || !email) return sendResponse(400, {error: "Name or email missing"});

    const command = new PutItemCommand({
        TableName: "BonzaiBookings", //insert right name!!!
        Item: {
            id: { S: generateId() },
            
        }
    })

    return sendResponse();
}