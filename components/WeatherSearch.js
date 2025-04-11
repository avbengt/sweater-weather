"use client";

import { useState, useEffect } from "react";
import { getCoordinates } from "@/utils/getCoordinates";
import WeatherIcon from "@/components/WeatherIcon";

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
  IE: "Ireland", CA: "Canada", FR: "France", DE: "Germany", IN: "India", AU: "Australia",
  MX: "Mexico", BR: "Brazil", JP: "Japan", CN: "China", IT: "Italy", ES: "Spain",
  SE: "Sweden", NO: "Norway", NZ: "New Zealand"
};

export default function WeatherSearch() {
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [units, setUnits] = useState("imperial");
  const [isNight, setIsNight] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dewPoint, setDewPoint] = useState(null);
  const [uvi, setUvi] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [conditionId, setConditionId] = useState(null);
  const [iconCode, setIconCode] = useState(null);
  const [description, setDescription] = useState("");

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
  }, [selectedLocation, units]);

  const fetchSuggestions = async (query) => {
    setError("");
    const result = await getCoordinates(query, units);
    if (!result) {
      setError("Location not found.");
      setLocations([]);
      return;
    }
    if (Array.isArray(result)) {
      setLocations(result);
      setActiveIndex(-1);
    } else {
      let cityName = "";
      let reverseState = "";
    
      try {
        const reverseGeoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${result.lat}&lon=${result.lon}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
        );
        const reverseGeoData = await reverseGeoRes.json();
        if (Array.isArray(reverseGeoData) && reverseGeoData.length > 0) {
          cityName = reverseGeoData[0].name || "";
          reverseState = reverseGeoData[0].state || "";
        }
      } catch (e) {
        console.error("Reverse geocoding failed", e);
      }
    
      const fixedResult = {
        city: cityName || `ZIP ${result.zip || input}`,
        name: cityName || `ZIP ${result.zip || input}`,
        state: reverseState || result.state || "",
        country: result.country || "US",
        zip: result.zip || input,
        lat: result.lat,
        lon: result.lon,
      };
    
      setLocations([fixedResult]);
      setActiveIndex(0);
    }
  };

  const fetchWeather = async (locationData) => {
    try {
      const response = await fetch(
        `/api/fetch-weather-by-coords?lat=${locationData.lat}&lon=${locationData.lon}&units=${units}&_t=${Date.now()}`
      );
      const data = await response.json();
      const now = data.dt;
      const sunrise = data.sys.sunrise;
      const sunset = data.sys.sunset;
      const isNightTime = now < sunrise || now > sunset;

      if (!data || data.error) {
        setError("Weather could not be loaded.");
        return;
      }

      setWeather({
        ...locationData,
        weather: data,
      });
      setIsNight(isNightTime);
      setConditionId(data.weather[0].id);
      setIconCode(data.weather[0].icon);
      setDescription(data.weather[0].description);

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

  const handleKeyDown = (e) => {
    if (locations.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < locations.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : locations.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        const loc = locations[activeIndex];
        const locationWithCity = {
          ...loc,
          city: loc.city || loc.name || `ZIP ${loc.zip || input}`,
          lat: loc.lat,
          lon: loc.lon,
        };
        setInput(`${loc.city || loc.name}${loc.state ? `, ${loc.state}` : ""}, ${countryLookup[loc.country] || loc.country}`);
        setLocations([]);
        setSelectedLocation(locationWithCity);
      }
    } else if (e.key === "Escape") {
      setLocations([]);
      setActiveIndex(-1);
    }
  };
  
  const toggleUnits = () => {
    setUnits((prev) => (prev === "imperial" ? "metric" : "imperial"));
  };

  const hasWeatherData = weather?.weather?.main?.temp !== undefined;

  return (
    <div className="flex justify-center flex-col items-center w-full p-4 sm:w-2/3 h-2/3 max-w-6xl mx-auto">

      <div className="dp-frame">
        <div className="datapoint w-full flex flex-col">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Enter city name or ZIP code..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setSelectedLocation(null);
              }}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-2 p-2 border border-gray-300 rounded-md text-center"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="#000"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 3 10.5a7.5 7.5 0 0 0 13.65 6.15z"
                />
              </svg>
            </div>
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
                        setInput(`${loc.city || loc.name}${loc.state ? `, ${loc.state}` : ""}, ${countryLookup[loc.country] || loc.country}`);
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

          {error && <p className="text-red-500 mt-2">{error}</p>}

        </div>
      </div>

      {hasWeatherData && (
        <div className="mt-4 w-full flex flex-col justify-center items-center">
          <div className="dp-frame w-full">
            <div className="datapoint w-full flex flex-col">
              <div className="w-full">
                <h2 className="text-xl font-semibold">

                {/*  Imperial / Metric Toggle  */}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs ${units === "imperial" ? "font-bold" : "text-gray-600"}`}>
                    Imperial (°F)
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={units === "metric"}
                      onChange={toggleUnits}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#63a9c2] rounded-full transition-colors duration-300 inset-shadow-sm inset-shadow-black/10" />
                    <div className="absolute top-0 left-0 w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-5" />
                  </label>

                  <span className={`text-xs ${units === "metric" ? "font-bold" : "text-gray-600"}`}>
                    Metric (°C)
                  </span>
                </div>
                {/*  End Imperial / Metric Toggle  */}



                  {(weather.city || weather.name || `ZIP ${weather.zip || ""}`) +
                    (weather.state ? `, ${stateLookup[weather.state.toLowerCase()] || weather.state}` : "") +
                    (weather.country && weather.country !== "US"
                      ? `, ${countryLookup[weather.country] || weather.country}`
                      : "")}
                </h2>
              </div>
              <div className="w-full flex">
                <div className="size-fit">
                {conditionId && (
                    <>
                      <WeatherIcon
                        conditionId={weather.weather.weather[0].id}
                        isNight={isNight}
                        className="w-32 h-32 text-gray-700"
                      />
                      <p className="text-gray-700">
                        {description.charAt(0).toUpperCase() + description.slice(1)}
                      </p>
                    </>
                  )}
                </div>
                <div className="size-fit">
                  <p className="text-gray-700 text-8xl">
                    {/* Temperature */}
                    {Math.round(weather.weather.main.temp)}°{units === "imperial" ? "F" : "C"}
                  </p>
                  <p>Feels like: {Math.round(weather.weather.main.feels_like)}°</p>
                </div>
              </div>
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
