import { useEffect, useState } from "react";

/**
 * Hook untuk menunda pembaruan nilai hingga user berhenti mengetik
 * selama `delay` milidetik.
 *
 * Berguna untuk mencegah API dipanggil setiap kali ada perubahan karakter
 * di input pencarian.
 *
 * @param value - Nilai yang ingin di-debounce (biasanya state input)
 * @param delay - Jeda waktu dalam milidetik (default 500ms)
 *
 * @example
 * const debouncedCity = useDebounce(searchInput, 500);
 * // debouncedCity baru berubah 500ms setelah user berhenti mengetik
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set timer yang akan mengupdate nilai setelah delay berlalu
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Jika value berubah sebelum timer selesai, timer lama dibatalkan
        // dan timer baru dimulai — inilah intinya debounce
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
