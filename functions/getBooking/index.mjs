import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
        return sendResponse(400, { error: "Missing bookingId"});
    }

};