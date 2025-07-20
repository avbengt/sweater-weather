"use client";

import { useRef, useState, useEffect } from "react";
import fetchWeather from "@/utils/fetchWeather";
import { getCoordinates } from "@/utils/getCoordinates";
import WeatherIcon from "@/components/WeatherIcon";
import PlacesAutocompleteInput from "@/components/PlacesAutocompleteInput";
import { iconRegistry } from "@/components/iconRegistry";
import MoonPhase from "@/components/MoonPhase";
import { mapWeatherIcon } from "@/components/iconRegistry";

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
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [timezoneOffset, setTimezoneOffset] = useState(0);


  function formatHour(unix, offset) {
    const localTime = new Date((unix + offset) * 1000);
    return localTime.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  }

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
          console.error("Error getting geolocation:", {
            code: error?.code,
            message: error?.message,
            fullError: error,
          });
          setError("Location access denied or unavailable. Please search manually.");
          setIsInitialLoad(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,  // 5 seconds
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
      console.error("Weather fetch failed or result is undefined:", result);
      setError(result?.error || "Failed to fetch weather data.");
      return;
    }

    const {
      current,
      dewPoint,
      uvi,
      moonPhase,
      dailyForecast,
      hourlyForecast,
      timezoneOffset,
    } = result;
    setTimezoneOffset(timezoneOffset);

    if (!current) {
      console.error("Weather data is missing or incomplete:", result);
      setError("Weather data is incomplete.");
      return;
    }

    const now = current.dt;
    const localTimeFormatted = new Date(now * 1000).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    setLocalTime(localTimeFormatted);

    const sunrise = current?.sunrise || 0;
    const sunset = current?.sunset || 0;
    const isNightTime = now < sunrise || now > sunset;

    let cityName = "";
    let stateName = "";
    let countryName = "US";
    let zip = "";

    try {
      const googleRes = await fetch(
        `/api/reverseGeocode?lat=${loc.lat}&lon=${loc.lon}`
      );
      const googleData = await googleRes.json();

      if (googleData.results && googleData.results.length > 0) {
        const components = googleData.results[0].address_components;

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
        const zipComponent = components.find(c =>
          c.types.includes("postal_code")
        );

        cityName = cityComponent?.long_name || "";
        stateName = stateComponent?.short_name || "";
        countryName = countryComponent?.short_name || "US";
        zip = zipComponent?.long_name || "";
      }
    } catch (error) {
      console.error("Google reverse geocoding failed:", error);
    }

    if (!inputFocused) {
      setInput(`${cityName}${stateName ? `, ${stateLookup[stateName.toLowerCase()] || stateName}` : ""}${countryName !== "US" ? `, ${countryLookup[countryName] || countryName}` : ""}`);
    }

    setWeather({
      lat: loc.lat,
      lon: loc.lon,
      city: cityName,
      state: stateName,
      country: countryName,
      zip: zip,
      current: current,
      daily: dailyForecast,
      visibility: current.visibility,
      wind: current.wind_speed,
      windDeg: current.wind_deg,
      conditionId: current.weather[0].id,
      description: current.weather[0].description,
      sunrise: current.sunrise,
      sunset: current.sunset,
      temp: current.temp,
      feels_like: current.feels_like,
      pressure: current.pressure,
      humidity: current.humidity,
    });

    setIsNight(isNightTime);
    setConditionId(current.weather[0].id);
    setDescription(current.weather[0].description);
    setDewPoint(dewPoint);
    setUvi(uvi);
    setMoonPhase(moonPhase);
    setFiveDayForecast(dailyForecast);
    setHourlyForecast(hourlyForecast);
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

  const hasWeatherData = weather?.temp !== undefined;

  const HumidityIcon = iconRegistry["wi-humidity"];
  const PressureIcon = iconRegistry["wi-barometer"];
  const VisibilityIcon = iconRegistry["wi-visibility"];
  const WindIcon = iconRegistry["wi-wind"];
  const DewPointIcon = iconRegistry["wi-dewpoint"];
  const UVIcon = iconRegistry["wi-uvi"];
  const SunriseIcon = iconRegistry["wi-sunrise"];
  const SunsetIcon = iconRegistry["wi-sunset"];
  const HighLowIcon = iconRegistry["wi-thermometer"];

  return (
    <div>
      <header className="h-[50px] sm:h-[50px] md:h-[76px] bg-slate-800 text-slate-200 shadow-md p-2 md:p-4 z-1">
        <div className="flex items-center justify-between h-full relative max-w-7xl mx-auto px-1 md:px-4">
          <div className="flex items-center">
            <span className="ml-2 [font-family:var(--font-fjord-one)] text-white text-base md:text-2xl">alissa.dev<span className="text-[#5ce1e6] [font-family:var(--font-dancing-script)] text-xl md:text-3xl font-bold border-l border-l-slate-600 ps-2 ms-2">weather</span></span>
          </div>

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

          <div className="hidden md:flex items-center gap-3 md:px-4">
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

      <div className="flex justify-center flex-col items-center w-full px-0 py-0 md:px-4 md:py-8 max-w-7xl mx-auto">
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
                        conditionId={weather.conditionId}
                        description={weather.description}
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
                    {Math.round(weather.temp)}°{ /* units === "imperial" ? "F" : "C" */}
                  </p>
                  <p>Feels like: {Math.round(weather.feels_like)}°</p>
                </div>
              </div>



              <div className="relative w-full mt-6">
                {/* Gradient Arrows */}
                <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-[#30b0b6]/60 to-transparent pointer-events-none z-10 rounded-l" />
                <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-[#30b0b6]/60 to-transparent pointer-events-none z-10 rounded-r" />

                {/* Scrollable Row with Drag Support */}
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto gap-2 hide-scrollbar px-2 cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    setStartX(e.pageX - scrollRef.current.offsetLeft);
                    setScrollLeft(scrollRef.current.scrollLeft);
                  }}
                  onMouseLeave={() => setIsDragging(false)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseMove={(e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const x = e.pageX - scrollRef.current.offsetLeft;
                    const walk = (x - startX) * 1.5;
                    scrollRef.current.scrollLeft = scrollLeft - walk;
                  }}
                >

                  {hourlyForecast.map((hour, index) => {
                    const IconComponent = mapWeatherIcon(hour.weather[0].icon);

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-between w-18 bg-[#30b0b6]/10 p-2 rounded-md text-center text-sm flex-shrink-0"
                      >
                        <p className="font-semibold">{formatHour(hour.dt, timezoneOffset)}</p>
                        {IconComponent && <IconComponent className="w-10 h-10 text-[#30b0b6]" />}
                        <p className="font-bold text-base">{Math.round(hour.temp)}°</p>
                      </div>
                    );
                  })}
                </div>
              </div>


              <ul className="mt-8">

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {HighLowIcon && <HighLowIcon className="w-6 h-6" />}
                    <span>High / Low:</span>
                  </div>
                  <span>
                    {Math.round(fiveDayForecast[0]?.temp?.max)}° /
                    {Math.round(fiveDayForecast[0]?.temp?.min)}°
                  </span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {HumidityIcon && <HumidityIcon className="w-6 h-6" />}
                    <span>Humidity:</span>
                  </div>
                  <span>{weather.humidity}%</span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {PressureIcon && <PressureIcon className="w-6 h-6" />}
                    <span>Pressure:</span>
                  </div>
                  <span>{weather.pressure} hPa</span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {VisibilityIcon && <VisibilityIcon className="w-6 h-6" />}
                    <span>Visibility:</span>
                  </div>
                  <span>{weather.visibility / 1000} km</span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {WindIcon && <WindIcon className="w-6 h-6" />}
                    <span>Wind:</span>
                  </div>
                  <span>
                    {weather.wind} {units === "imperial" ? "mph" : "m/s"}{" "}
                    {weather.windDeg ? `from ${weather.windDeg}°` : ""}
                  </span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {DewPointIcon && <DewPointIcon className="w-6 h-6" />}
                    <span>Dew Point:</span>
                  </div>
                  <span>{dewPoint !== null ? `${Math.round(dewPoint)}°` : "N/A"}</span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {UVIcon && <UVIcon className="w-6 h-6" />}
                    <span>UV Index:</span>
                  </div>
                  <span>{uvi !== null ? uvi : "N/A"}</span>
                </li>

                <MoonPhase moonPhase={weather?.moon_phase} />

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {SunriseIcon && <SunriseIcon className="w-6 h-6" />}
                    <span>Sunrise:</span>
                  </div>
                  <span>
                    {new Date(weather.sunrise * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>

                <li className="datapoint">
                  <div className="flex items-center gap-3">
                    {SunsetIcon && <SunsetIcon className="w-6 h-6" />}
                    <span>Sunset:</span>
                  </div>
                  <span>
                    {new Date(weather.sunset * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>

              </ul>


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
