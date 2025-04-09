"use client";

import { useState, useEffect } from "react";
import { getCoordinates } from "@/utils/getCoordinates";

const stateLookup = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO",
  connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY"
};

const countryLookup = {
  IE: "Ireland",
  CA: "Canada",
  FR: "France",
  DE: "Germany",
  IN: "India",
  AU: "Australia",
  MX: "Mexico",
  BR: "Brazil",
  JP: "Japan",
  CN: "China",
  IT: "Italy",
  ES: "Spain",
  SE: "Sweden",
  NO: "Norway",
  NZ: "New Zealand"
};

const iconMap = {
  200: "thunderstorm.png",
  201: "thunderstorm.png",
  202: "thunderstorm.png",
  210: "light-thunderstorm.png",
  211: "thunderstorm.png",
  212: "heavy-thunderstorm.png",
  221: "ragged-thunderstorm.png",
  230: "thunderstorm-drizzle.png",
  231: "thunderstorm-drizzle.png",
  232: "thunderstorm-drizzle.png",
  300: "drizzle.png",
  301: "drizzle.png",
  302: "drizzle.png",
  310: "drizzle.png",
  311: "drizzle.png",
  312: "drizzle.png",
  313: "drizzle.png",
  314: "drizzle.png",
  321: "drizzle.png",
  500: "light-rain.png",
  501: "moderate-rain.png",
  502: "heavy-rain.png",
  503: "very-heavy-rain.png",
  504: "extreme-rain.png",
  511: "freezing-rain.png",
  520: "shower-rain.png",
  521: "shower-rain.png",
  522: "shower-rain.png",
  531: "shower-rain.png",
  600: "light-snow.png",
  601: "snow.png",
  602: "heavy-snow.png",
  611: "sleet.png",
  612: "sleet.png",
  613: "sleet.png",
  615: "rain-snow.png",
  616: "rain-snow.png",
  620: "light-snow.png",
  621: "snow.png",
  622: "heavy-snow.png",
  701: "mist.png",
  711: "smoke.png",
  721: "haze.png",
  731: "dust.png",
  741: "fog.png",
  751: "sand.png",
  761: "dust.png",
  762: "volcanic-ash.png",
  771: "squalls.png",
  781: "tornado.png",
  800: "clear.png",
  801: "few-clouds.png",
  802: "scattered-clouds.png",
  803: "broken-clouds.png",
  804: "overcast.png"
};


export default function WeatherSearch() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [units, setUnits] = useState("imperial");
  const [error, setError] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dewPoint, setDewPoint] = useState(null);
  const [uvi, setUvi] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (selectedLocation) return;

      if (input.trim().length >= 2) {
        fetchSuggestions(input);
      } else {
        setLocations([]);
        setActiveIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lon) {
      fetchWeather(selectedLocation);
    }
  }, [units]);

  const fetchSuggestions = async (query) => {
    setError("");
    const result = await getCoordinates(query, units);
    if (!result) {
      setError("Location not found.");
      setLocations([]);
      return;
    }
    if (Array.isArray(result)) {
      if (result.length === 1) {
        const single = {
          ...result[0],
          city: result[0].name,
          lat: result[0].lat,
          lon: result[0].lon,
        };
        setSelectedLocation(single);
        setLocations([]);
        fetchWeather(single);
      } else {
        setLocations(result);
        setActiveIndex(-1);
      }
    } else {
      const fixedResult = {
        city: result.city || result.name,
        state: result.state || "",
        country: result.country || "US",
        zip: result.zip || null,
        lat: result.lat,
        lon: result.lon,
      };
      setSelectedLocation(fixedResult);
      setLocations([]);
      fetchWeather(fixedResult);
    }
  };

  const fetchWeather = async (locationData) => {
    try {
      const response = await fetch(
        `/api/fetch-weather-by-coords?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}&_t=${Date.now()}`
      );
      const data = await response.json();

      if (!data || data.error) {
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
      setError("Failed to fetch weather for selected location.");
    }
  };

  const toggleUnits = () => {
    setUnits((prev) => (prev === "imperial" ? "metric" : "imperial"));
  };

  const handleKeyDown = (e) => {
    if (locations.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < locations.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : locations.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        const loc = locations[activeIndex];
        const locationWithCity = {
          ...loc,
          city: loc.name,
          lat: loc.lat,
          lon: loc.lon,
        };
        setInput(`${loc.name}${loc.state ? `, ${loc.state}` : ""}, ${countryLookup[loc.country] || loc.country}`);
        setLocations([]);
        setSelectedLocation(locationWithCity);
        fetchWeather(locationWithCity);
      }
    } else if (e.key === "Escape") {
      setLocations([]);
      setActiveIndex(-1);
    }
  };

  const hasWeatherData = weather?.weather?.main?.temp !== undefined;

  return (
    <div className="flex justify-center flex-col items-center w-full p-4 sm:w-2/3 h-2/3 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Sweater Weather</h1>

      <div className="relative mb-4 w-4/5 sm:w-1/3">
        <input
          type="text"
          placeholder="Enter city name or ZIP code..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelectedLocation(null);
          }}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 rounded-md text-center"
        />
        {locations.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
            {locations.map((loc, index) => {
              const locationWithCity = {
                ...loc,
                city: loc.name,
                lat: loc.lat,
                lon: loc.lon,
              };
              const isActive = index === activeIndex;
              return (
                <li
                  key={index}
                  onClick={() => {
                    setInput(`${loc.name}${loc.state ? `, ${loc.state}` : ""}, ${countryLookup[loc.country] || loc.country}`);
                    setLocations([]);
                    setSelectedLocation(locationWithCity);
                    fetchWeather(locationWithCity);
                  }}
                  className={`cursor-pointer px-4 py-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
                >
                  {loc.name}{loc.state ? `, ${loc.state}` : ""}, {countryLookup[loc.country] || loc.country}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2">
        <span className={`text-sm ${units === "imperial" ? "font-bold" : "text-gray-600"}`}>
          Imperial (°F)
        </span>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={units === "metric"}
            onChange={toggleUnits}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full transition-colors duration-300" />
          <div className="absolute top-0 left-0 w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-5" />
        </label>

        <span className={`text-sm ${units === "metric" ? "font-bold" : "text-gray-600"}`}>
          Metric (°C)
        </span>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {hasWeatherData && (
        <div className="mt-4 w-full flex flex-col justify-center items-center">

          <div className="dp-frame w-full">
            <div className="datapoint w-full">

              <h2 className="text-xl font-semibold">
                {weather.city}
                {weather.country === "US" && weather.state
                  ? `, ${stateLookup[weather.state.toLowerCase()] || weather.state}`
                  : weather.country !== "US"
                    ? weather.state
                      ? `, ${weather.state}, ${countryLookup[weather.country] || weather.country}`
                      : `, ${countryLookup[weather.country] || weather.country}`
                    : ""}
              </h2>
              <p className="text-gray-700 text-8xl">
                {/* Temperature */}
                {Math.round(weather.weather.main.temp)}°{units === "imperial" ? "F" : "C"}
              </p>
              <p>Feels like: {Math.round(weather.weather.main.feels_like)}°</p>
              <p className="text-gray-700">
                {/* Condition */}
                {weather.weather.weather[0].description.charAt(0).toUpperCase() + weather.weather.weather[0].description.slice(1)}
              </p>
              <img
                src={`/weather-icons/${iconMap[weather.weather.weather[0].id]}`}
                alt="Weather Icon"
              />
            </div>
          </div>



          <div className="w-full mt-4 grid grid-cols-2 gap-4 text-gray-700">
            <div className="dp-frame">
              <div className="datapoint">
                <p>High / Low: <span>{Math.round(weather.weather.main.temp_max)}° / {Math.round(weather.weather.main.temp_min)}°</span></p>
              </div>
            </div>
            <div className="dp-frame">
              <div className="datapoint">
                <p>Humidity: <span>{weather.weather.main.humidity}%</span></p>
              </div>
            </div>
            <div className="dp-frame">
              <div className="datapoint">
                <p>Pressure: <span>{weather.weather.main.pressure} hPa</span></p>
              </div>
            </div>
            <div className="dp-frame">
              <div className="datapoint">
                <p>Visibility: <span>{weather.weather.visibility / 1000} km</span></p>
              </div>
            </div>
            <div className="dp-frame">
              <div className="datapoint">
                <p>
                  Wind: <span>{weather.weather.wind.speed} {units === "imperial" ? "mph" : "m/s"}{" "}
                    {weather.weather.wind.deg ? `from ${weather.weather.wind.deg}°` : ""}</span>
                </p>
              </div>
            </div>
            <div className="dp-frame">
              <div className="datapoint">
                <p>Sunrise: <span>{new Date(weather.weather.sys.sunrise * 1000).toLocaleTimeString()}</span></p>
                <p>Sunset: <span>{new Date(weather.weather.sys.sunset * 1000).toLocaleTimeString()}</span></p>
              </div>
            </div>

            {dewPoint !== null && (
              <div className="dp-frame">
                <div className="datapoint">
                  <p>Dew Point: {Math.round(dewPoint)}°</p>
                </div>
              </div>
            )}
            {uvi !== null && (
              <div className="dp-frame">
                <div className="datapoint">
                  <p>UV Index: {uvi}</p>
                </div>
              </div>
            )}
            {moonPhase !== null && (
              <div className="dp-frame">
                <div className="datapoint">
                  <p>Moon Phase: {moonPhase}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
