/**
 * Menentukan apakah di kota tujuan saat ini sedang siang atau malam,
 * berdasarkan data langsung dari OpenWeatherMap — bukan jam lokal perangkat.
 *
 * Rumus:
 *   Waktu lokal kota (detik sejak epoch) = dt + timezone
 *   Jam lokal (0–23)                     = floor((dt + timezone) / 3600) % 24
 *   Siang = jam 6 hingga 17 (06:00–17:59)
 *
 * @param dt       - Unix timestamp (detik) saat data cuaca diobservasi oleh OWM
 * @param timezone - UTC offset kota dalam detik (e.g. 25200 untuk WIB / UTC+7)
 *
 * @example
 *   // Jakarta UTC+7, dt = 1700000000
 *   getLocalIsDaytime(1700000000, 25200) // → true atau false tergantung jam
 */
export function getLocalIsDaytime(dt: number, timezone: number): boolean {
    // Waktu lokal kota dalam detik sejak epoch (tanpa memperhitungkan DST,
    // OWM sudah menangani ini di field timezone-nya)
    const localSeconds = dt + timezone;

    // Ambil jam lokal (0–23). Modulo 24 diperlukan karena localSeconds bisa
    // menghasilkan nilai jam > 24 jika dt sangat besar
    const localHour = Math.floor(localSeconds / 3600) % 24;

    // Siang didefinisikan jam 06:00 s.d. 17:59 (inklusif)
    return localHour >= 6 && localHour < 18;
}
