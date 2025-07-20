export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = searchParams.get("units") || "imperial";

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: "Missing coordinates" }), { status: 400 });
  }

  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

  try {
    console.log("Fetching OpenWeather One Call:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data || data?.current === undefined) {
      console.error("OpenWeather 3.0 One Call response missing expected data:", data);
      throw new Error("Invalid response from One Call API");
    }

    return new Response(JSON.stringify({
      current: data.current,
      hourly: data.hourly?.slice(0, 48) ?? [],
      daily: data.daily ?? [],
      dew_point: data.current?.dew_point ?? null,
      uvi: data.current?.uvi ?? null,
      moon_phase: data.daily?.[0]?.moon_phase ?? null,
      timezone_offset: data.timezone_offset ?? 0
    }), { status: 200 });

  } catch (error) {
    console.error("One Call API error:", error);
    return new Response(JSON.stringify({ error: "One Call API fetch failed" }), { status: 500 });
  }
}