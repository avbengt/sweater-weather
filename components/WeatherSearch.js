"use client";

import { useState, useEffect } from "react";
import fetchWeather from "@/utils/fetchWeather";
import { getCoordinates } from "@/utils/getCoordinates";
import WeatherIcon from "@/components/WeatherIcon";
import PlacesAutocompleteInput from "@/components/PlacesAutocompleteInput";
import { iconRegistry } from "@/components/iconRegistry";
import MoonPhase from "@/components/MoonPhase";

const stateLookup = {
  // (same stateLookup as before)
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [locations, setLocations] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState("");
  const [units, setUnits] = useState("imperial");
  const [error, setError] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [conditionId, setConditionId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [dewPoint, setDewPoint] = useState(null);
  const [uvi, setUvi] = useState(null);
  const [moonPhase, setMoonPhase] = useState(null);
  const [fiveDayForecast, setFiveDayForecast] = useState([]);

  // Fetch weather on initial load using geolocation

  useEffect(() => {
    if (isInitialLoad && "geolocation" in navigator) {
      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Geolocation position received:", latitude, longitude);
          setSelectedLocation({ lat: latitude, lon: longitude });
          setIsInitialLoad(false);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setError("Location access denied or unavailable. Please search manually.");
          setIsInitialLoad(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,  // 20 seconds
          maximumAge: 0    // always get a fresh position
        }
      );
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (selectedLocation && weather) {
      setInput("");
    }
  }, [selectedLocation, weather]);

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lon) {
      (async () => {
        const result = await fetchWeather(selectedLocation, units);
        handleWeatherResult(result, selectedLocation);
      })();
    }
  }, [selectedLocation, units]);

  const handleWeatherResult = async (result, loc) => {
    if (!result || result.error) {
      setError("Failed to fetch weather data.");
      return;
      console.log("weatherData:", weatherData);
    }

    const { weatherData, dewPoint, uvi, moonPhase, dailyForecast } = result;

    if (!weatherData || !weatherData.sys) {
      console.error("Weather data is missing or incomplete:", weatherData);
      setError("Weather data is incomplete.");
      return;
    }

    const now = weatherData.dt;

    const localTimeFormatted = new Date(now * 1000).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    setLocalTime(localTimeFormatted);
    const sunrise = weatherData?.sys?.sunrise || 0;
    const sunset = weatherData?.sys?.sunset || 0;
    const isNightTime = now < sunrise || now > sunset;

    let cityName = loc.city || "";
    let stateName = loc.state || "";
    let countryName = loc.country || "US";

    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const googleData = await googleRes.json();

      if (googleData.results && googleData.results.length > 0) {
        // Filter results containing the ZIP code
        const resultsWithZip = googleData.results.filter(r => {
          return r.address_components.some(c =>
            c.types.includes("postal_code") &&
            c.long_name === loc.zip
          );
        });

        const resultToUse = resultsWithZip[0] || googleData.results[0];

        const components = resultToUse.address_components;

        // Try sublocality > neighborhood > locality > postal_town
        const cityComponent =
          components.find(c => c.types.includes("postal_town")) ||
          components.find(c => c.types.includes("sublocality_level_1")) ||
          components.find(c => c.types.includes("locality")) ||
          components.find(c => c.types.includes("neighborhood"));

        const stateComponent = components.find(c =>
          c.types.includes("administrative_area_level_1")
        );
        const countryComponent = components.find(c =>
          c.types.includes("country")
        );

        cityName = cityComponent?.long_name || cityName;
        stateName = stateComponent?.short_name || stateName;
        countryName = countryComponent?.short_name || countryName;
      }
    } catch (error) {
      console.error("Google reverse geocoding failed:", error);
    }

    // Only set input if user hasn't manually typed
    if (!inputFocused) {
      setInput(`${cityName}${stateName ? `, ${stateLookup[stateName.toLowerCase()] || stateName}` : ""}${countryName !== "US" ? `, ${countryLookup[countryName] || countryName}` : ""}`);
    }

    setWeather({
      ...loc,
      city: cityName,
      state: stateName,
      country: countryName,
      weather: weatherData,
      moon_phase: moonPhase,
    });
    setIsNight(isNightTime);
    setConditionId(weatherData.weather[0].id);
    setDescription(weatherData.weather[0].description);
    setDewPoint(dewPoint);
    setUvi(uvi);
    setMoonPhase(moonPhase);
    setFiveDayForecast(dailyForecast);
  };

  const toggleUnits = () => {
    setUnits((prev) => (prev === "imperial" ? "metric" : "imperial"));
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && input.trim().length > 0) {
      e.preventDefault();
      try {
        const result = await getCoordinates(input, units);
        if (Array.isArray(result) && result.length > 0) {
          const loc = result[0];
          setSelectedLocation({
            city: loc.name,
            state: loc.state,
            country: loc.country,
            lat: loc.lat,
            lon: loc.lon
          });
          setInput(""); // Clear the input on Enter
          // Immediately fetch weather
          const weatherResult = await fetchWeather(loc, units);
          handleWeatherResult(weatherResult, loc);
        } else if (result) {
          setSelectedLocation({
            city: result.name,
            state: result.state,
            country: result.country,
            lat: result.lat,
            lon: result.lon
          });
          setInput("");
          const weatherResult = await fetchWeather(result, units);
          handleWeatherResult(weatherResult, result);
        } else {
          setError("Location not found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch location.");
      }
    }
  };

  const hasWeatherData = weather?.weather?.main?.temp !== undefined;

  const HumidityIcon = iconRegistry["wi-humidity"];
  const PressureIcon = iconRegistry["wi-barometer"];
  const VisibilityIcon = iconRegistry["wi-visibility"];
  const WindIcon = iconRegistry["wi-wind"];
  const DewPointIcon = iconRegistry["wi-dewpoint"];
  const UVIcon = iconRegistry["wi-day-sunny"];
  const SunriseIcon = iconRegistry["wi-sunrise"];
  const SunsetIcon = iconRegistry["wi-sunset"];
  const LowTempIcon = iconRegistry["wi-low-temperature"];
  const HighTempIcon = iconRegistry["wi-high-temperature"];

  return (
    <div>
      <header className="bg-slate-800 text-slate-200 shadow-md py-1 z-1">
        <div className="flex items-center justify-between p-4 relative max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            {/* <img src="/logo.svg" alt="Logo" className="w-12" /> */}
            <span className="ml-2 [font-family:var(--font-fjord-one)] text-white text-2xl">alissa.dev<span className="text-[#5ce1e6] [font-family:var(--font-dancing-script)] text-3xl font-bold border-l border-l-slate-600 ps-2 ms-2">weather</span></span>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 w-1/2 max-w-md">
            <div className="relative">
              <PlacesAutocompleteInput
                value={input}
                onChange={(val) => setInput(val)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onPlaceSelected={async (place) => {
                  const newLocation = {
                    city: place.name,
                    state: place.state,
                    country: place.country,
                    lat: place.lat,
                    lon: place.lon
                  };

                  setSelectedLocation(newLocation);
                  const result = await fetchWeather(newLocation, units);
                  handleWeatherResult(result, newLocation);
                  setInput(""); // Clear input after selection
                }}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"></div>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${units === "imperial" ? "font-bold" : "text-slate-400"}`}>
              °F
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={units === "metric"}
                onChange={toggleUnits}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-slate-500 rounded-full transition-colors duration-300" />
              <div className="absolute top-0 left-0 w-4 h-4 bg-slate-300 border border-slate-300 rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-3" />
            </label>
            <span className={`text-sm ${units === "metric" ? "font-bold" : "text-slate-400"}`}>
              °C
            </span>
          </div>
        </div>

      </header>

      <div className="flex justify-center flex-col items-center w-full px-4 py-8 max-w-7xl mx-auto">
        {hasWeatherData && (
          <div className="w-full flex flex-col justify-center items-center">
            <div className="container w-full flex flex-col">
              <div className="w-full text-left">
                <h2 className="[font-family:var(--font-fjord-one)] text-[#30b0b6] text-3xl font-bold border-b border-b-slate-300 pb-4">
                  {weather.city && weather.state ? (
                    <>
                      {weather.city}
                      {weather.state ? `, ${stateLookup[weather.state.toLowerCase()] || weather.state}` : ""}
                      {weather.country && weather.country !== "US"
                        ? `, ${countryLookup[weather.country] || weather.country}`
                        : ""}
                    </>
                  ) : (
                    `ZIP ${weather.zip || ""}`
                  )}
                  {localTime && (
                    <span className="text-slate-500 font-normal text-base [font-family:var(--font-inter)] ms-2">
                      as of {localTime}
                    </span>
                  )}
                </h2>
              </div>
              <div className="mt-8 w-full flex">
                <div className="size-fit">
                  {conditionId && (
                    <>
                      <WeatherIcon
                        conditionId={weather.weather.weather[0].id}
                        description={weather.weather.weather[0].description}
                        isNight={isNight}
                        className="w-32 h-32 text-[#30b0b6]"
                      />
                      <p className="text-slate-700">
                        {description.charAt(0).toUpperCase() + description.slice(1)}
                      </p>
                    </>
                  )}
                </div>
                <div className="size-fit">
                  <p className="text-slate-700 text-8xl">
                    {/* Temperature */}
                    {Math.round(weather.weather.main.temp)}°{ /* units === "imperial" ? "F" : "C" */}
                  </p>
                  <p>Feels like: {Math.round(weather.weather.main.feels_like)}°</p>
                </div>
              </div>

              <ul className="mt-8">
                <p className="datapoint">High / Low: <span>{Math.round(weather.weather.main.temp_max)}° / {Math.round(weather.weather.main.temp_min)}°</span></p>

                <p className="datapoint">
                  {HumidityIcon && <HumidityIcon className="inline w-8 h-8 mr-1" />}
                  Humidity: <span>{weather.weather.main.humidity}%</span>
                </p>

                <p className="datapoint">
                  {PressureIcon && <PressureIcon className="inline w-8 h-8 mr-1" />}
                  Pressure: <span>{weather.weather.main.pressure} hPa</span>
                </p>

                <p className="datapoint">
                  {VisibilityIcon && <VisibilityIcon className="inline w-8 h-8 mr-1" />}
                  Visibility: <span>{weather.weather.visibility / 1000} km</span>
                </p>

                <p className="datapoint">
                  {WindIcon && <WindIcon className="inline w-8 h-8 mr-1" />}
                  Wind: <span>{weather.weather.wind.speed} {units === "imperial" ? "mph" : "m/s"}{" "}
                    {weather.weather.wind.deg ? `from ${weather.weather.wind.deg}°` : ""}</span>
                </p>

                <p className="datapoint">
                  {DewPointIcon && <DewPointIcon className="inline w-8 h-8 mr-1" />}
                  Dew Point: {dewPoint !== null && (<span>{Math.round(dewPoint)}°</span>)}
                </p>

                <p className="datapoint">
                  {UVIcon && <UVIcon className="inline w-8 h-8 mr-1" />}
                  UV Index: <span>{uvi !== null ? uvi : "N/A"}</span>
                </p>

                <MoonPhase moonPhase={weather?.moon_phase} />

              </ul>



              <p className="datapoint">
                {SunriseIcon && <SunriseIcon className="inline w-8 h-8 mr-1" />}
                Sunrise: <span>{new Date(weather.weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>


              <p className="datapoint">
                {SunsetIcon && <SunsetIcon className="inline w-8 h-8 mr-1" />}
                Sunset: <span>{new Date(weather.weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>

            </div>

            {fiveDayForecast.length > 0 && (
              <div className="w-full mt-6">
                <h3 className="text-lg font-bold mb-2 text-center">5-Day Forecast</h3>
                <div className="">
                  {fiveDayForecast.map((day) => (
                    <div key={day.dt} className="dp-frame">
                      <div className="datapoint text-center">
                        <p className="font-semibold">
                          {new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                        <WeatherIcon
                          conditionId={day.weather[0].id}
                          isNight={isNight}
                          className="w-14 h-14 text-[#30b0b6] mx-auto"
                        />
                        <p>{Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°</p>
                        <p className="capitalize">{day.weather[0].description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
