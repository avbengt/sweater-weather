const fetchWeather = async (locationData) => {
  console.log("Re-fetching weather for:", locationData);
  try {
    const response = await fetch(
      `/api/fetch-weather-by-coords?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}`
    );
    const data = await response.json();

    if (!data || data.error) {
      console.error("Weather fetch failed:", data);
      setError("Weather could not be loaded.");
      return;
    }

    setWeather({
      ...locationData,
      weather: data,
    });

    const oneCallResponse = await fetch(
      `/api/onecall-weather?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}`
    );
    const oneCallData = await oneCallResponse.json();
    
    if (!oneCallData || oneCallData.error) {
      console.error("One Call API error:", oneCallData);
    } else {
      setDewPoint(oneCallData.dew_point);
      setUvi(oneCallData.uvi);
      setMoonPhase(oneCallData.moon_phase);
    }
  } catch (error) {
    console.error("Fetch weather error:", error);
    setError("Failed to fetch weather for selected location.");
  }
};