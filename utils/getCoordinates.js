const getCoordinates = async (query, units) => {
  try {
    const response = await fetch(
      `/api/weather?location=${encodeURIComponent(query)}&units=${units}`
    );
    const data = await response.json();

    if (!data || data.error || (Array.isArray(data) && data.length === 0)) {
      console.warn("No matching location found for query:", query);
      return [];
    }

    if (Array.isArray(data)) {
      // Prioritize results that have a name (i.e., are a city) over ones that only have a zip
      const cityResults = data.filter(item => item.name && item.name !== item.zip);
      if (cityResults.length > 0) {
        return cityResults.map(item => ({
          ...item,
          name: item.name || `ZIP ${item.zip}`
        }));
      }

      // If no proper city results found, fallback to showing the zip but flagged as 'ZIP'
      return data.map(item => ({
        ...item,
        name: item.name || `ZIP ${item.zip}`
      }));
    } else {
      if (!data.name && data.zip) {
        data.name = `ZIP ${data.zip}`;
      }
      return [data];
    }
  } catch (error) {
    console.error("getCoordinates failed:", error);
    return [];
  }
};

export { getCoordinates };