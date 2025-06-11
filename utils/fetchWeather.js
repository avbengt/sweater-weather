export default async function fetchWeather(locationData, units = "imperial") {
  try {
    // Fetch current weather
    const response = await fetch(
      `/api/fetch-weather-by-coords?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}&_t=${Date.now()}`
    );
    const weatherData = await response.json();

    if (!weatherData || weatherData.error) {
      console.error("Weather fetch failed:", weatherData);
      return { error: "Failed to fetch weather data." };
    }

    // Fetch one call API
    const oneCallResponse = await fetch(
      `/api/onecall-weather?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}`
    );
    const oneCallData = await oneCallResponse.json();

    if (!oneCallData || oneCallData.error) {
      console.error("One Call API error:", oneCallData);
      return {
        weatherData,
        dewPoint: null,
        uvi: null,
        moonPhase: null,
        dailyForecast: [],
      };
    }

    return {
      weatherData,
      dewPoint: oneCallData?.dew_point || null,
      uvi: oneCallData?.uvi || null,
      moonPhase: oneCallData?.moon_phase || null,
      dailyForecast: oneCallData?.daily?.slice(1, 6) || [],
    };
  } catch (error) {
    console.error("Fetch weather error:", error);
    return { error: "Failed to fetch weather data." };
  }
}