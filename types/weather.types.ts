// Struktur data cuaca yang dikembalikan oleh API Route kita (/api/weather)
export interface WeatherData {
    city: string;
    country: string;
    temperature: number;    // dalam satuan Celsius
    feelsLike: number;      // suhu terasa seperti, Celsius
    humidity: number;       // persentase kelembapan (0–100)
    description: string;   // deskripsi kondisi cuaca, e.g. "hujan ringan"
    icon: string;           // kode ikon dari OpenWeatherMap, e.g. "10d"
    windSpeed: number;      // kecepatan angin dalam m/s
    timezone: number;       // UTC offset kota dalam detik, e.g. 25200 untuk WIB (UTC+7)
    dt: number;             // Unix timestamp (detik) saat data cuaca diobservasi oleh OWM
}

// Struktur respons error dari API Route kita
export interface WeatherErrorResponse {
    error: string;
}
