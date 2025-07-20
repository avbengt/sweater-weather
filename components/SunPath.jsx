"use client";

import React, { useEffect, useState } from "react";
import { iconRegistry } from "@/components/iconRegistry";

const SunIcon = iconRegistry["wi-day-sunny"];

const SunPath = ({ sunrise, sunset }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const now = Date.now() / 1000;
            const pct = Math.min(Math.max((now - sunrise) / (sunset - sunrise), 0), 1);
            setProgress(pct);
        };

        updateProgress();
        const interval = setInterval(updateProgress, 60000);
        return () => clearInterval(interval);
    }, [sunrise, sunset]);

    const getSunPosition = (t) => {
        const x = (1 - t) ** 2 * 0 + 2 * (1 - t) * t * 50 + t ** 2 * 100;
        const y = (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 0 + t ** 2 * 50;
        return { x, y };
    };

    const { x, y } = getSunPosition(progress);

    return (
        <div className="w-full h-32 mt-6">
            <svg viewBox="0 0 100 60" className="w-full h-full">
                <path d="M0,50 Q50,0 100,50" stroke="#30b0b5" fill="none" strokeWidth="1" />

                {SunIcon && (
                    <foreignObject x={x - 5} y={y - 5} width="15" height="15">
                        <SunIcon className="w-full h-full text-yellow-500 bg-[#E7ECF1] rounded-full" />
                    </foreignObject>
                )}
            </svg>
        </div>
    );
};

export default SunPath;