"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Definisi tiap awan: posisi vertikal, ukuran, kecepatan, dan opasitas
// Dibuat manual (bukan random murni) supaya layout terasa natural, bukan acak
const CLOUDS: {
    top: string;
    width: string;
    duration: number;
    opacity: number;
    delay: number;
}[] = [
        { top: "8%", width: "220px", duration: 28, opacity: 0.85, delay: 0 },
        { top: "18%", width: "160px", duration: 22, opacity: 0.65, delay: 5 },
        { top: "30%", width: "280px", duration: 35, opacity: 0.75, delay: 10 },
        { top: "12%", width: "190px", duration: 26, opacity: 0.55, delay: 15 },
        { top: "40%", width: "140px", duration: 20, opacity: 0.50, delay: 3 },
    ];

interface CloudyBackgroundProps {
    isDay: boolean;
}

export function CloudyBackground({ isDay }: CloudyBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cloudEls = Array.from(
            container.querySelectorAll<HTMLDivElement>(".cloud-item")
        );

        const animations: gsap.core.Tween[] = [];

        cloudEls.forEach((cloud, idx) => {
            const config = CLOUDS[idx];

            // Mulai dari luar layar kanan, lalu geser ke kiri hingga keluar layar kiri
            // Dengan repeat: -1, awan akan terus berputar tanpa henti
            const anim = gsap.fromTo(
                cloud,
                { x: "110vw" },
                {
                    x: "-40vw",
                    duration: config.duration,
                    delay: config.delay,
                    ease: "none",
                    repeat: -1,
                }
            );

            animations.push(anim);
        });

        return () => {
            animations.forEach((anim) => anim.kill());
        };
    }, []);

    // Warna awan berbeda antara siang dan malam
    // Siang: putih cerah — Malam: abu-abu kebiruan redup
    const cloudColor = isDay ? "bg-white/80" : "bg-slate-300/30";
    const cloudColorMid = isDay ? "bg-white/90" : "bg-slate-300/40";

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden="true"
        >
            {CLOUDS.map((cloud, i) => (
                <div
                    key={i}
                    className="cloud-item absolute"
                    style={{
                        top: cloud.top,
                        width: cloud.width,
                        // Di malam hari opasitas dikurangi lagi agar awan tidak
                        // terlalu kontras dengan latar gelap
                        opacity: isDay ? cloud.opacity : cloud.opacity * 0.6,
                    }}
                >
                    {/* Awan dibentuk dari tiga lingkaran yang tumpang tindih */}
                    <div className="relative flex items-end">
                        <div className={`h-10 w-10 rounded-full ${cloudColor}`} />
                        {/* Tonjolan tengah — lebih besar untuk kesan awan yang "gembung" */}
                        <div className={`relative -mx-2 h-16 w-20 rounded-full ${cloudColorMid}`} />
                        <div className={`h-12 w-14 rounded-full ${cloudColor}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}
