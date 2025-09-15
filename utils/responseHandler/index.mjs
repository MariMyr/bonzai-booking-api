export function sendResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export function success(body, statusCode = 200) {
    return sendResponse(statusCode, body);
};

export function error(message, statusCode = 500) {
    return sendResponse(statusCode, { error: message });
};

