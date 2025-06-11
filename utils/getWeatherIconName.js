const iconMap = {
    200: "thunderstorm",
    201: "thunderstorm",
    202: "thunderstorm",
    210: "lightning",
    211: "lightning",
    212: "lightning",
    221: "lightning",
    230: "thunderstorm",
    231: "thunderstorm",
    232: "thunderstorm",
    300: "sprinkle",
    301: "sprinkle",
    302: "rain",
    310: "rain-mix",
    311: "rain",
    312: "rain",
    313: "showers",
    314: "rain",
    321: "sprinkle",
    500: "sprinkle",
    501: "rain",
    502: "rain",
    503: "rain",
    504: "rain",
    511: "rain-mix",
    520: "showers",
    521: "showers",
    522: "showers",
    531: "storm-showers",
    600: "snow",
    601: "snow",
    602: "sleet",
    611: "rain-mix",
    612: "rain-mix",
    615: "rain-mix",
    616: "rain-mix",
    620: "rain-mix",
    621: "snow",
    622: "snow",
    701: "showers",
    711: "smoke",
    721: "haze",
    731: "dust",
    741: "fog",
    761: "dust",
    762: "dust",
    771: "cloudy-gusts",
    781: "tornado",
    800: "clear",
    801: "cloudy-gusts",
    802: "cloudy-gusts",
    803: "cloudy-gusts",
    804: "cloudy",
    900: "tornado",
    901: "storm-showers",
    902: "hurricane",
    903: "snowflake-cold",
    904: "hot",
    905: "strong-wind",
    906: "hail",
    957: "strong-wind"
};

export function getWeatherIconName(conditionId, description, isNight) {
    let base = iconMap[conditionId] || "clear";

    const desc = description ? description.toLowerCase() : "";

    if (desc.includes("scattered clouds")) base = "cloudy";
    if (desc.includes("overcast clouds")) base = "cloudy";
    if (desc.includes("haze")) base = "day-haze";

    if (!base.startsWith("day-") && !base.startsWith("night-")) {
        base = `${isNight ? "night-alt" : "day"}-${base}`;
    }

    return `wi-${base}`;
}