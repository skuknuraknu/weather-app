"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface SunnyBackgroundProps {
    isDay: boolean;
}

export function SunnyBackground({ isDay }: SunnyBackgroundProps) {
    const sunRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    // Ref untuk bulan (mode malam)
    const moonRef = useRef<HTMLDivElement>(null);
    const moonGlowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDay) {
            const sun = sunRef.current;
            const glow = glowRef.current;
            if (!sun || !glow) return;

            // Rotasi penuh (360°) selama 20 detik, berulang selamanya
            const spinAnim = gsap.to(sun, {
                rotation: 360,
                duration: 20,
                ease: "none",
                repeat: -1,
            });

            // Efek glow yang "bernapas" — skala naik-turun perlahan
            const glowAnim = gsap.to(glow, {
                scale: 1.25,
                opacity: 0.6,
                duration: 3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            return () => {
                spinAnim.kill();
                glowAnim.kill();
            };
        } else {
            // Mode malam: animasi bulan mengambang (float vertikal halus)
            const moon = moonRef.current;
            const moonGlow = moonGlowRef.current;
            if (!moon || !moonGlow) return;

            const floatAnim = gsap.to(moon, {
                y: -10,
                duration: 4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            // Glow bulan "bernapas" — lebih lambat dan dingin dibanding matahari
            const glowAnim = gsap.to(moonGlow, {
                scale: 1.2,
                opacity: 0.4,
                duration: 5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            return () => {
                floatAnim.kill();
                glowAnim.kill();
            };
        }
    }, [isDay]);

    if (isDay) {
        return (
            <div
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
                aria-hidden="true"
            >
                {/* Lingkaran glow lebih besar di belakang matahari */}
                <div
                    ref={glowRef}
                    className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-yellow-300/30 blur-3xl"
                />

                {/* Elemen matahari utama dengan ring "sinar" berbentuk bintang */}
                <div
                    ref={sunRef}
                    className="absolute top-8 right-8 flex h-36 w-36 items-center justify-center"
                >
                    {/* Sinar-sinar matahari — 8 garis yang tersusun melingkar */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <span
                            key={i}
                            className="absolute h-1 w-16 rounded-full bg-yellow-400/70"
                            style={{ transform: `rotate(${i * 45}deg)` }}
                        />
                    ))}

                    {/* Lingkaran inti matahari */}
                    <div className="relative z-10 h-16 w-16 rounded-full bg-yellow-400 shadow-[0_0_40px_12px_rgba(250,204,21,0.5)]" />
                </div>
            </div>
        );
    }

    // Mode malam: bulan sabit dengan glow biru-putih dingin
    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            {/* Lingkaran glow bulan — lebih dingin (putih-biru) */}
            <div
                ref={moonGlowRef}
                className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-blue-200/15 blur-3xl"
            />

            {/* Bulan sabit — dibuat dari dua lingkaran yang tumpang tindih */}
            <div
                ref={moonRef}
                className="absolute top-10 right-10 h-20 w-20"
            >
                {/* Lingkaran penuh bulan */}
                <div className="absolute inset-0 rounded-full bg-slate-200 shadow-[0_0_30px_8px_rgba(148,163,184,0.4)]" />
                {/* Potongan bayangan untuk membentuk sabit */}
                <div className="absolute -top-1 -right-1 h-20 w-20 rounded-full bg-blue-950" />
                {/* cahaya samar di tepi bulan */}
                <div className="absolute inset-0 rounded-full ring-1 ring-slate-300/30" />
            </div>
        </div>
    );
}
