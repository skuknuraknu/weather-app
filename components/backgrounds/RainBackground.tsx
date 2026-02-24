"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Jumlah tetesan yang muncul bersamaan — cukup banyak untuk terasa deras
// tapi tidak berlebihan agar performa tetap ringan
const TOTAL_DROPS = 80;

interface RainBackgroundProps {
    isDay: boolean;
}

export function RainBackground({ isDay }: RainBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Kumpulkan semua element tetesan yang sudah dirender
        const drops = Array.from(
            container.querySelectorAll<HTMLSpanElement>(".rain-drop")
        );

        // Simpan semua instance animasi agar bisa kita kill saat cleanup
        const animations: gsap.core.Tween[] = [];

        drops.forEach((drop) => {
            // Posisi horizontal acak di seluruh lebar layar
            const startX = Math.random() * 100;

            // Durasi jatuh yang sedikit berbeda-beda (0.5–1.2 detik)
            // supaya tidak semua tetes terasa serentak
            const duration = 0.5 + Math.random() * 0.7;

            // Ubah panjang tetesan juga sedikit agar terasa alami
            const height = 10 + Math.random() * 14;

            gsap.set(drop, {
                left: `${startX}%`,
                height: `${height}px`,
                opacity: 0.3 + Math.random() * 0.5,
            });

            const anim = gsap.fromTo(
                drop,
                { y: "-5vh" },
                {
                    y: "105vh",
                    duration,
                    // Delay awal acak supaya tetesan tidak mulai dari posisi yang sama
                    delay: Math.random() * 2,
                    ease: "none",
                    // repeat: -1 berarti looping selamanya
                    repeat: -1,
                    // repeatDelay kecil agar tetes berikutnya tidak langsung muncul
                    repeatDelay: Math.random() * 0.5,
                }
            );

            animations.push(anim);
        });

        // Cleanup: hentikan semua animasi agar tidak memory leak
        return () => {
            animations.forEach((anim) => anim.kill());
        };
    }, []);

    // Siang: tetesan biru segar — Malam: tetesan abu gelap (suram, dingin)
    const dropColor = isDay ? "bg-blue-300/60" : "bg-slate-400/45";

    return (
        <div
            ref={containerRef}
            // pointer-events-none agar tidak menghalangi klik user
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            {Array.from({ length: TOTAL_DROPS }).map((_, i) => (
                <span
                    key={i}
                    className={`rain-drop absolute top-0 w-px rounded-full ${dropColor}`}
                />
            ))}
        </div>
    );
}
