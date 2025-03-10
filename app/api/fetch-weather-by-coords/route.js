export async function GET(request) {
    console.log("Incoming fetch-weather-by-coords units:", request.url);
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const units = searchParams.get("units") || "imperial";
  
    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), { status: 400 });
    }
  
    const API_KEY = process.env.WEATHER_API_KEY;
    const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  
    try {
      const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
      console.log("OpenWeatherMap URL:", url);
      const response = await fetch(url);
      const weather = await response.json();
  
      return new Response(JSON.stringify(weather), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch weather" }), { status: 500 });
    }
  }