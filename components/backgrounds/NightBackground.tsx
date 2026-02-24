"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Jumlah bintang — cukup banyak untuk terasa penuh tapi tetap elegan
const TOTAL_STARS = 80;

// Setiap bintang punya ukuran, posisi, dan ritme kedip yang unik
// agar langit malam terasa organik, bukan grid
interface StarConfig {
    top: string;
    left: string;
    size: number;
    delay: number;
    duration: number;
}

function generateStars(): StarConfig[] {
    // Menggunakan seed sederhana dengan Math.random — setiap render
    // akan berbeda tapi itu tidak masalah karena dibungkus useEffect
    return Array.from({ length: TOTAL_STARS }, () => ({
        top: `${Math.random() * 95}%`,
        left: `${Math.random() * 100}%`,
        // Bintang kecil (1–3px) agar terasa jauh dan realistis
        size: 1 + Math.random() * 2,
        delay: Math.random() * 5,
        // Durasi kedip 2–5 detik — variasi supaya tidak sinkron
        duration: 2 + Math.random() * 3,
    }));
}

// Posisi dan ukuran tiap bintang digenerate SEKALI di level modul —
// bukan di dalam component function — agar tidak berubah saat re-render
// (yang terjadi setiap user mengetik di input field).
const STARS = generateStars();

export function NightBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const starEls = Array.from(
            container.querySelectorAll<HTMLSpanElement>(".star-dot")
        );

        const animations: gsap.core.Tween[] = [];

        starEls.forEach((star, i) => {
            // Kedipan: opacity naik-turun antara 0.2 dan 1 secara bergantian
            const anim = gsap.to(star, {
                opacity: 0.15 + Math.random() * 0.3,
                duration: 2 + i % 3,  // variasi durasi berdasarkan indeks
                delay: (i * 0.07) % 5, // stagger terdistribusi
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            animations.push(anim);
        });

        return () => {
            animations.forEach((anim) => anim.kill());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            {/* Glow bulan samar di pojok kiri atas */}
            <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

            {/* Titik-titik bintang */}
            {STARS.map((star, i) => (
                <span
                    key={i}
                    className="star-dot absolute rounded-full bg-white"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: 0.6 + Math.random() * 0.4,
                    }}
                />
            ))}
        </div>
    );
}
