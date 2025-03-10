export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const units = searchParams.get("units") || "imperial";

  if (!location) {
    return new Response(JSON.stringify({ error: "Location is required" }), { status: 400 });
  }

  const API_KEY = process.env.WEATHER_API_KEY;
  const BASE_URL_CITY = "https://api.openweathermap.org/geo/1.0/direct";
  const BASE_URL_ZIP = "https://api.openweathermap.org/geo/1.0/zip";
  const BASE_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather";

  const stateLookup = {
    alabama: "AL",
    alaska: "AK",
    arizona: "AZ",
    arkansas: "AR",
    california: "CA",
    colorado: "CO",
    connecticut: "CT",
    delaware: "DE",
    florida: "FL",
    georgia: "GA",
    hawaii: "HI",
    idaho: "ID",
    illinois: "IL",
    indiana: "IN",
    iowa: "IA",
    kansas: "KS",
    kentucky: "KY",
    louisiana: "LA",
    maine: "ME",
    maryland: "MD",
    massachusetts: "MA",
    michigan: "MI",
    minnesota: "MN",
    mississippi: "MS",
    missouri: "MO",
    montana: "MT",
    nebraska: "NE",
    nevada: "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    ohio: "OH",
    oklahoma: "OK",
    oregon: "OR",
    pennsylvania: "PA",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    tennessee: "TN",
    texas: "TX",
    utah: "UT",
    vermont: "VT",
    virginia: "VA",
    washington: "WA",
    "west virginia": "WV",
    wisconsin: "WI",
    wyoming: "WY"
  };

  try {
    let geoUrl;
    let isZip = /^\d{5}$/.test(location);

    if (isZip) {
      geoUrl = `${BASE_URL_ZIP}?zip=${location},US&appid=${API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || !geoData.lat || !geoData.lon) {
        throw new Error("ZIP code not found");
      }

      const weatherUrl = `${BASE_URL_WEATHER}?lat=${geoData.lat}&lon=${geoData.lon}&units=${units}&appid=${API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${geoData.lat}&lon=${geoData.lon}&limit=1&appid=${API_KEY}`;
      const reverseGeoResponse = await fetch(reverseGeoUrl);
      const reverseGeoData = await reverseGeoResponse.json();
      let stateAbbrev = "";
      if (Array.isArray(reverseGeoData) && reverseGeoData[0]?.state) {
        const reverseStateRaw = reverseGeoData[0].state;
        const normalized = reverseStateRaw.toLowerCase();
        stateAbbrev = stateLookup[normalized] || reverseStateRaw;
      }

      return new Response(
        JSON.stringify({
          city: geoData.name || `ZIP ${location}`,
          state: stateAbbrev, // use the normalized abbreviation
          country: geoData.country || "US",
          zip: location,
          lat: geoData.lat,
          lon: geoData.lon,
          weather: weatherData
        }),
        { status: 200 }
      );
    } else {
      const parts = location.split(/[,\s]+/).filter(Boolean);
      const city = parts[0] || "";
      const stateOrCountry = parts[1] || "";

      let stateAbbrev = stateOrCountry;
      const normalized = stateOrCountry.toLowerCase();
      if (stateLookup[normalized]) {
        stateAbbrev = stateLookup[normalized];
      }

      const q = city;
      geoUrl = `${BASE_URL_CITY}?q=${encodeURIComponent(q)}&limit=10&appid=${API_KEY}`;

      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error("City not found");
      }

      const uniqueMap = new Map();
      geoData.forEach((loc) => {
        const key = `${loc.name}-${loc.state || ""}-${loc.country}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            name: loc.name,
            state: loc.state || "",
            country: loc.country,
            lat: loc.lat,
            lon: loc.lon,
            zip: null,
          });
        }
      });

      const results = Array.from(uniqueMap.values());
      return new Response(JSON.stringify(results), { status: 200 });
    }
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
