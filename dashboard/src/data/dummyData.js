// All dummy data has been removed.
// This application now fetches data exclusively from the backend API.
// If no database is connected, the API will return empty arrays and the frontend will display '0' values in red.

export const dummyData = {};

// Return false to always use real API
export function isDummyMode() {
  return false;
}

// Export empty defaults for backward compatibility
export default dummyData;
