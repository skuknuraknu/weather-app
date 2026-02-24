"use client";

/**
 * Skeleton loader untuk card cuaca.
 * Ditampilkan saat data sedang di-fetch agar user tidak melihat layar kosong.
 *
 * Menggunakan animasi "pulse" dari Tailwind yang cukup ringan dan tidak
 * memerlukan GSAP — GSAP lebih cocok untuk animasi interaktif, bukan loader.
 */
export function WeatherSkeleton() {
    return (
        <div
            className="w-full max-w-sm animate-pulse rounded-2xl bg-white/10 p-6 backdrop-blur-md"
            // Beritahu screen reader bahwa ini sedang memuat
            aria-label="Sedang memuat data cuaca..."
            role="status"
        >
            {/* Baris nama kota */}
            <div className="mb-4 h-6 w-2/3 rounded-lg bg-white/20" />

            {/* Suhu besar di tengah */}
            <div className="mb-6 h-16 w-1/2 rounded-xl bg-white/25" />

            {/* Deskripsi kondisi */}
            <div className="mb-2 h-4 w-3/4 rounded-md bg-white/20" />
            <div className="mb-6 h-4 w-1/2 rounded-md bg-white/15" />

            {/* Grid detail: humidity, wind, feels like */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 rounded-xl bg-white/10 p-3">
                        <div className="h-3 w-full rounded bg-white/20" />
                        <div className="h-5 w-3/4 rounded bg-white/25" />
                    </div>
                ))}
            </div>
        </div>
    );
}
