
"use client";

import Image from "next/image";
import { getHeroImage } from "@/utils/getHeroImage";

export default function HeroImage({ conditionId, iconCode, description }) {
    const heroImage = getHeroImage(conditionId, iconCode);

    return (
        <>
            {heroImage ? (
                <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px]">
                    <Image
                        src={`/images/${heroImage}`}
                        alt={description}
                        fill
                        className="object-contain"
                    />
                </div>
            ) : (
                <div className="text-white/75 my-6">Loading image...</div>
            )}
        </>
    );
}