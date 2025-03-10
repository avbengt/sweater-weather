export async function getCoordinates(location, units = "imperial") {
  try {
    const response = await fetch(`/api/weather?location=${location}&units=${units}`);
    const data = await response.json();

    if (!data || data.error) {
      throw new Error("Location not found");
    }

    if (Array.isArray(data)) {
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}