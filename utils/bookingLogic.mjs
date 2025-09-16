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
