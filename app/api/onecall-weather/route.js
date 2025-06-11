export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = searchParams.get("units") || "imperial";

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: "Missing coordinates" }), { status: 400 });
  }

  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.cod) {
      throw new Error("Failed to fetch one call data");
    }

    return new Response(JSON.stringify({
      dew_point: data.current.dew_point,
      uvi: data.current.uvi,
      moon_phase: data.daily?.[0]?.moon_phase ?? null,
      daily: data.daily
    }), { status: 200 });
  } catch (error) {
    console.error("One Call API error:", error);
    return new Response(JSON.stringify({ error: "One Call API fetch failed" }), { status: 500 });
  }
}