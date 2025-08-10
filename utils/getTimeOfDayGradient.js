export function getTimeOfDayGradient(now, sunrise, sunset) {
    const oneHour = 3600;

    const blueHourMorningStart = sunrise - oneHour;
    const goldenHourEveningEnd = sunset + oneHour;
    const goldenHourStart = sunset - oneHour;
    const blueHourEveningStart = sunset;
    const morningEnd = sunrise + 2 * oneHour;
    const afternoonStart = morningEnd + 3 * oneHour;

    if (now < blueHourMorningStart || now > goldenHourEveningEnd) {
        return "bg-gradient-to-b from-[#003972] to-[#001322]"; // g1 Deep Night
    }

    if (now >= blueHourMorningStart && now < sunrise) {
        return "bg-gradient-to-b from-[#0092de] to-[#003d6c]"; // g7 Blue Hour Morning
    }

    if (now >= sunrise && now < goldenHourStart) {
        return "bg-gradient-to-b from-[#0092de] to-[#003d6c]"; // g8 Afternoon
    }

    if (now >= goldenHourStart && now < sunset) {
        return "bg-gradient-to-b from-[#5b2c83] to-[#a44065]"; // g18 Golden Hour
    }

    if (now >= blueHourEveningStart && now <= goldenHourEveningEnd) {
        return "bg-gradient-to-b from-[#28166b] to-[#5b2c83]"; // Blue Hour Evening
    }

    return "bg-gradient-to-b from-[#003972] to-[#001322]"; // fallback Night
}