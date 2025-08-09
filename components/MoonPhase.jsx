"use client";

import React from "react";
import { iconRegistry } from "@/components/iconRegistry";

function getMoonPhaseIcon(moonPhase) {
    if (moonPhase === 0) return "wi-moon-new";
    if (moonPhase > 0 && moonPhase < 0.25) {
        if (moonPhase < 0.04) return "wi-moon-waxing-crescent-1";
        if (moonPhase < 0.08) return "wi-moon-waxing-crescent-2";
        if (moonPhase < 0.12) return "wi-moon-waxing-crescent-3";
        if (moonPhase < 0.16) return "wi-moon-waxing-crescent-4";
        if (moonPhase < 0.2) return "wi-moon-waxing-crescent-5";
        return "wi-moon-waxing-crescent-6";
    }
    if (moonPhase === 0.25) return "wi-moon-first-quarter";
    if (moonPhase > 0.25 && moonPhase < 0.5) {
        if (moonPhase < 0.3) return "wi-moon-waxing-gibbous-1";
        if (moonPhase < 0.34) return "wi-moon-waxing-gibbous-2";
        if (moonPhase < 0.38) return "wi-moon-waxing-gibbous-3";
        if (moonPhase < 0.42) return "wi-moon-waxing-gibbous-4";
        if (moonPhase < 0.46) return "wi-moon-waxing-gibbous-5";
        return "wi-moon-waxing-gibbous-6";
    }
    if (moonPhase === 0.5) return "wi-moon-full";
    if (moonPhase > 0.5 && moonPhase < 0.75) {
        if (moonPhase < 0.54) return "wi-moon-waning-gibbous-1";
        if (moonPhase < 0.58) return "wi-moon-waning-gibbous-2";
        if (moonPhase < 0.62) return "wi-moon-waning-gibbous-3";
        if (moonPhase < 0.66) return "wi-moon-waning-gibbous-4";
        if (moonPhase < 0.7) return "wi-moon-waning-gibbous-5";
        return "wi-moon-waning-gibbous-6";
    }
    if (moonPhase === 0.75) return "wi-moon-third-quarter";
    if (moonPhase > 0.75 && moonPhase < 1) {
        if (moonPhase < 0.8) return "wi-moon-waning-crescent-1";
        if (moonPhase < 0.84) return "wi-moon-waning-crescent-2";
        if (moonPhase < 0.88) return "wi-moon-waning-crescent-3";
        if (moonPhase < 0.92) return "wi-moon-waning-crescent-4";
        if (moonPhase < 0.96) return "wi-moon-waning-crescent-5";
        return "wi-moon-waning-crescent-6";
    }
    return "wi-moon-new";
}

function getMoonPhaseLabel(moonPhase) {
    if (moonPhase === 0) return "New Moon";
    if (moonPhase > 0 && moonPhase < 0.25) return "Waxing Crescent";
    if (moonPhase === 0.25) return "First Quarter";
    if (moonPhase > 0.25 && moonPhase < 0.5) return "Waxing Gibbous";
    if (moonPhase === 0.5) return "Full Moon";
    if (moonPhase > 0.5 && moonPhase < 0.75) return "Waning Gibbous";
    if (moonPhase === 0.75) return "Last Quarter";
    if (moonPhase > 0.75 && moonPhase <= 1) return "Waning Crescent";
    return "Unknown";
}

export default function MoonPhase({ moonPhase }) {
    moonPhase = parseFloat(moonPhase);

    if (isNaN(moonPhase)) {
        return (
            <li className="datapoint">
                <div className="flex items-center gap-3">
                    <span>Moon Phase:</span>
                </div>
                <span>N/A</span>
            </li>
        );
    }

    const iconClass = getMoonPhaseIcon(moonPhase);
    const label = getMoonPhaseLabel(moonPhase);
    const IconComponent = iconRegistry[iconClass];

    return (
        <li className="datapoint border-none">
            <div className="flex items-center gap-3">
                {IconComponent && <IconComponent className="w-6 h-6 fill-white" />}
                <span>Moon Phase:</span>
            </div>
            <span>{label}</span>
        </li>
    );
}