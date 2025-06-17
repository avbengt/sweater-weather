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

    if (moonPhase > 0.5 && moonPhase < 0.75) {
        if (moonPhase < 0.58) return "wi-moon-alt-waning-gibbous-1";
        if (moonPhase < 0.62) return "wi-moon-alt-waning-gibbous-2";
        if (moonPhase < 0.66) return "wi-moon-alt-waning-gibbous-3";
        if (moonPhase < 0.7) return "wi-moon-alt-waning-gibbous-4";
        if (moonPhase < 0.75) return "wi-moon-alt-waning-gibbous-5";
        return "wi-moon-alt-waning-gibbous-6";
    }

    if (moonPhase > 0.75 && moonPhase < 1) {
        if (moonPhase < 0.8) return "wi-moon-alt-waning-crescent-1";
        if (moonPhase < 0.84) return "wi-moon-alt-waning-crescent-2";
        if (moonPhase < 0.88) return "wi-moon-alt-waning-crescent-3";
        if (moonPhase < 0.92) return "wi-moon-alt-waning-crescent-4";
        if (moonPhase < 0.96) return "wi-moon-alt-waning-crescent-5";
        return "wi-moon-alt-waning-crescent-6";
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
            <li className="datapoint">
                <div className="flex items-center gap-3">
                    <span>Moon Phase:</span>
                </div>
                <span>N/A</span>
            </li>
        );
    }

    const description = getMoonPhaseDescription(moonPhase);
    const iconKey = getMoonPhaseIconKey(moonPhase);
    const IconComponent = iconRegistry[iconKey] || iconRegistry["wi-na"];

    return (
        <li className="datapoint">
            <div className="flex items-center gap-3">
                {IconComponent && <IconComponent className="w-6 h-6" />}
                <span>Moon Phase:</span>
            </div>
            <span>{description}</span>
        </li>
    );
};

export default MoonPhase;