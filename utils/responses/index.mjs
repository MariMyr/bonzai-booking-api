export function sendResponse(statusCode, data) {
    return {
        statusCode,
        body: JSON.stringify({ 
            data 
        })
    }
}