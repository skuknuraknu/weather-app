"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useWeather } from "@/hooks/use-weather";
import { WeatherSkeleton } from "@/components/ui/WeatherSkeleton";
import { ErrorToast } from "@/components/ui/ErrorToast";

/**
 * Komponen pencarian cuaca yang mengintegrasikan:
 * - Debounce input (500ms) agar API tidak dipanggil tiap keystroke
 * - Skeleton loading saat data masih diambil
 * - Error toast jika pencarian gagal
 */
export function SearchBar() {
    // Nilai mentah dari input — berubah setiap kali user mengetik
    const [inputValue, setInputValue] = useState("");

    // Nilai yang sudah di-debounce — baru berubah 500ms setelah user berhenti mengetik
    // Nilai ini yang dikirim ke hook fetcher agar API tidak kelebihan request
    const debouncedCity = useDebounce(inputValue, 500);

    const { data, isLoading, isError, error } = useWeather(debouncedCity);

    return (
        <div className="relative flex w-full max-w-sm flex-col items-center gap-4">
            {/* Input pencarian */}
            <div className="relative w-full">
                <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
                    aria-hidden="true"
                />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Cari kota... (e.g. Jakarta)"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-md outline-none transition focus:border-white/50 focus:bg-white/15"
                    aria-label="Cari kota"
                />
            </div>

            {/* Tampilkan skeleton saat loading & ada input */}
            {isLoading && debouncedCity && <WeatherSkeleton />}

            {/* Tampilkan data jika berhasil */}
            {data && !isLoading && (
                <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                    <p className="text-lg font-semibold text-white">
                        {data.city}, {data.country}
                    </p>
                    <p className="mt-1 text-5xl font-bold text-white">
                        {Math.round(data.temperature)}°C
                    </p>
                    <p className="mt-2 capitalize text-white/70">{data.description}</p>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                        <div className="rounded-xl bg-white/10 p-3">
                            <p className="text-white/50">Terasa</p>
                            <p className="font-medium text-white">{Math.round(data.feelsLike)}°</p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3">
                            <p className="text-white/50">Kelembapan</p>
                            <p className="font-medium text-white">{data.humidity}%</p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-3">
                            <p className="text-white/50">Angin</p>
                            <p className="font-medium text-white">{data.windSpeed} m/s</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast error — hanya muncul jika ada pesan error */}
            {isError && error && (
                <ErrorToast
                    message={error}
                    // key={error} agar toast muncul ulang jika error berbeda
                    key={error}
                />
            )}
        </div>
    );
}
