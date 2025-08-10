"use client";

import { useState } from "react";
import WeatherSearch from "@/components/WeatherSearch";

export default function Home() {
  const [bgClass, setBgClass] = useState("bg-gradient-to-b from-[#0092de] to-[#003d6c]");

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className={`fixed inset-0 z-0 ${bgClass} pointer-events-none will-change-transform transform-gpu`} />
      <main className="relative z-10 min-h-dvh">
        <WeatherSearch onGradientChange={setBgClass} />
      </main>
    </div>
  );
}