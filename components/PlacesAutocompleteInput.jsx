"use client";

import React from "react";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import LocationIcon from "@/public/search.svg";

const libraries = ["places"];

export default function PlacesAutocompleteInput({
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPlaceSelected
}) {
    const handlePlaceChanged = (ref) => {
        const place = ref?.getPlace?.();
        if (!place || !place.geometry) return;

        const lat = place.geometry.location.lat();
        const lon = place.geometry.location.lng();

        const components = place.address_components;

        const cityComponent = components.find(c =>
            c.types.includes("locality") ||
            c.types.includes("postal_town") ||
            c.types.includes("sublocality")
        );
        const stateComponent = components.find(c =>
            c.types.includes("administrative_area_level_1")
        );
        const countryComponent = components.find(c =>
            c.types.includes("country")
        );

        const cityName = cityComponent?.long_name || place.name || "";
        const state = stateComponent?.short_name || "";
        const country = countryComponent?.short_name || "";

        // Call parent handler
        if (onPlaceSelected) {
            onPlaceSelected({
                name: cityName,
                state,
                country,
                lat,
                lon
            });
        }

        // Also update the input value in the parent
        if (onChange) {
            const formattedInput = `${cityName}${state ? `, ${state}` : ""}${country !== "US" ? `, ${country}` : ""}`;
            onChange(formattedInput);
        }
    };

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
            libraries={libraries}
        >
            <div className="relative w-full">
                <LocationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Autocomplete
                    onLoad={(autocomplete) => (window.autocompleteRef = autocomplete)}
                    onPlaceChanged={() => handlePlaceChanged(window.autocompleteRef)}
                    options={{
                        types: ['(regions)'],
                        componentRestrictions: { country: 'us' }
                    }}
                >
                    <input
                        type="text"
                        placeholder="Enter city or ZIP"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown} // if you’re passing this from WeatherSearch
                        onFocus={onFocus}
                        onBlur={onBlur}
                        className="w-full pl-10 pr-10 p-2 bg-slate-700 text-slate-200 placeholder-slate-200 rounded-md text-center"
                    />
                </Autocomplete>
            </div>
        </LoadScript>
    );
}