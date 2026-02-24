import { useQuery } from "@tanstack/react-query";
import type { WeatherData, WeatherErrorResponse } from "@/types/weather.types";

// Fungsi fetcher terpisah supaya mudah di-test dan dipakai ulang
async function fetchWeather(city: string): Promise<WeatherData> {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

    // Ambil body dulu sebelum throw, supaya pesan error dari server bisa ikut dibawa
    const body: WeatherData | WeatherErrorResponse = await res.json();

    if (!res.ok) {
        // Lempar pesan error dari API Route, bukan pesan generik
        throw new Error((body as WeatherErrorResponse).error ?? "Gagal mengambil data cuaca.");
    }

    return body as WeatherData;
}

interface UseWeatherReturn {
    data: WeatherData | undefined;
    isLoading: boolean;
    isFetching: boolean;  // true saat refetch di background (data lama masih tampil)
    isError: boolean;
    error: string | null;  // pesan error yang siap ditampilkan ke UI
    refetch: () => void;
}

/**
 * Hook untuk mengambil data cuaca berdasarkan nama kota.
 *
 * @param city - Nama kota yang ingin dicari. Kosongkan ("") untuk menonaktifkan query.
 *
 * @example
 * const { data, isLoading, isError, error } = useWeather("Jakarta");
 */
export function useWeather(city: string): UseWeatherReturn {
    const trimmedCity = city.trim();

    const query = useQuery<WeatherData, Error>({
        // Query key menyertakan nama kota agar cache terpisah per kota
        queryKey: ["weather", trimmedCity],

        queryFn: () => fetchWeather(trimmedCity),

        // Jangan fetch kalau nama kota belum diisi
        enabled: trimmedCity.length > 0,

        // Data cuaca dianggap fresh selama 5 menit
        staleTime: 5 * 60 * 1000,

        // Jangan retry kalau kota memang tidak ditemukan (404), tapi retry sekali untuk error lain
        retry: (failureCount, err) => {
            if (err.message.includes("tidak ditemukan")) return false;
            return failureCount < 1;
        },
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error?.message ?? null,
        refetch: query.refetch,
    };
}
