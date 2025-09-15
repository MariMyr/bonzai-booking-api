import { ScanCommand } from "@aws-sdk/client-dynamodb"; // SCAN ska vi kanske inte använda? Men hur gör vi annars när vi inte har någon sort key?
import { client } from "../../services/db.mjs";
import { sendResponse } from "../../utils/responses/index.mjs";

export const handler = async (event) => {

};

// få tillbaka: bookingid, checkin, checkout, number of guests + roomms, name i lista. 