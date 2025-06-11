// components/MoonPhase.jsx
"use client";

import React from "react";
import { iconRegistry } from "@/components/iconRegistry";

const getMoonPhaseDescription = (phase) => {
    if (phase === 0 || phase === 1) return "New Moon";
    if (phase > 0 && phase < 0.25) return "Waxing Crescent";
    if (phase === 0.25) return "First Quarter";
    if (phase > 0.25 && phase < 0.5) return "Waxing Gibbous";
    if (phase === 0.5) return "Full Moon";
    if (phase > 0.5 && phase < 0.75) return "Waning Gibbous";
    if (phase === 0.75) return "Last Quarter";
    if (phase > 0.75 && phase < 1) return "Waning Crescent";
    return "Unknown";
};

const getMoonPhaseIconKey = (moonPhase) => {
    if (moonPhase > 0 && moonPhase < 0.25) {
        if (moonPhase < 0.05) return "wi-moon-alt-waxing-crescent-1";
        if (moonPhase < 0.1) return "wi-moon-alt-waxing-crescent-2";
        if (moonPhase < 0.15) return "wi-moon-alt-waxing-crescent-3";
        if (moonPhase < 0.2) return "wi-moon-alt-waxing-crescent-4";
        if (moonPhase < 0.25) return "wi-moon-alt-waxing-crescent-5";
        return "wi-moon-alt-waxing-crescent-6";
    }

    if (moonPhase > 0.25 && moonPhase < 0.5) {
        if (moonPhase < 0.33) return "wi-moon-alt-waxing-gibbous-1";
        if (moonPhase < 0.38) return "wi-moon-alt-waxing-gibbous-2";
        if (moonPhase < 0.42) return "wi-moon-alt-waxing-gibbous-3";
        if (moonPhase < 0.46) return "wi-moon-alt-waxing-gibbous-4";
        if (moonPhase < 0.5) return "wi-moon-alt-waxing-gibbous-5";
        return "wi-moon-alt-waxing-gibbous-6";
    }

    if (moonPhase === 0.5) return "wi-moon-alt-full";
    if (moonPhase === 0.25) return "wi-moon-alt-first-quarter";
    if (moonPhase === 0.75) return "wi-moon-alt-third-quarter";
    if (moonPhase === 0 || moonPhase === 1) return "wi-moon-alt-new";

    return "wi-na";
};

const MoonPhase = ({ moonPhase }) => {
    if (moonPhase === null || moonPhase === undefined) {
        return (
            <p className="datapoint">
                Moon Phase: <span>N/A</span>
            </p>
        );
    }

    const description = getMoonPhaseDescription(moonPhase);
    const iconKey = getMoonPhaseIconKey(moonPhase);
    const IconComponent = iconRegistry[iconKey] || iconRegistry["wi-na"];

    return (
        <p className="datapoint">
            {IconComponent && <IconComponent className="w-8 h-8 mr-1 inline-block" />}
            Moon Phase: <span>{description}</span>
        </p>
    );
};

export default MoonPhase;