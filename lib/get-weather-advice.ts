// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeatherAdvice {
    clothing: string;     // Saran pakaian yang sebaiknya dikenakan
    activity: string;    // Rekomendasi aktivitas yang sesuai kondisi
    warning: string | null; // Peringatan keamanan — null jika cuaca normal
}

// Kumpulan kondisi cuaca yang dianggap ekstrem — perlu peringatan khusus
// Kata kunci diambil dari deskripsi OpenWeatherMap (bahasa Inggris & Indonesia)
const EXTREME_KEYWORDS = [
    "thunderstorm",
    "tornado",
    "hurricane",
    "blizzard",
    "heavy snow",
    "heavy rain",
    "extreme",
    "violent",
    "badai",
    "topan",
    "hujan sangat deras",
];

// ─── Helper: cek apakah kondisi termasuk ekstrem ─────────────────────────────

function isExtremeWeather(condition: string): boolean {
    const lower = condition.toLowerCase();
    return EXTREME_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// ─── Helper: saran pakaian berdasarkan suhu ───────────────────────────────────

function getClothingAdvice(temperature: number, isDay: boolean): string {
    // Malam hari biasanya terasa lebih dingin, naikkan threshold sedikit
    const feels = isDay ? temperature : temperature - 3;

    if (feels < 10) {
        return "Cuaca sangat dingin — kenakan jaket tebal, syal, dan lapisan pakaian ekstra.";
    }

    if (feels < 20) {
        return "Cukup dingin — jaket atau hoodie sudah cukup untuk menjaga tubuh tetap hangat.";
    }

    if (feels <= 25) {
        return "Suhu nyaman — kaos atau kemeja tipis sudah cukup, bawa jaket ringan jika bepergian malam.";
    }

    if (feels <= 30) {
        return "Hangat — pilih bahan katun yang breathable agar tetap segar sepanjang hari.";
    }

    // > 30°C
    return "Panas terik — pakai pakaian tipis berwarna terang, topi, dan sunscreen jika keluar rumah.";
}

// ─── Helper: saran aktivitas berdasarkan kondisi cuaca ───────────────────────

function getActivityAdvice(condition: string, isDay: boolean): string {
    const lower = condition.toLowerCase();

    // Hujan — aktivitas outdoor tidak ideal
    if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("hujan")) {
        return "Cuaca hujan — waktu yang bagus untuk aktivitas indoor seperti membaca, memasak, atau olahraga di gym.";
    }

    // Berawan — outdoor masih oke, cuaca tidak terlalu terik
    if (lower.includes("cloud") || lower.includes("overcast") || lower.includes("awan")) {
        return "Cuaca mendung — nyaman untuk jalan-jalan santai, bersepeda, atau aktivitas outdoor ringan.";
    }

    // Salju atau es — hati-hati di luar
    if (lower.includes("snow") || lower.includes("sleet") || lower.includes("ice")) {
        return "Ada salju atau es — jika keluar, gunakan alas kaki anti-slip dan waspada jalanan licin.";
    }

    // Kabut — visibility rendah
    if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze") || lower.includes("kabut")) {
        return "Visibilitas rendah — hindari berkendara jauh, dan nyalakan lampu kendaraan jika terpaksa keluar.";
    }

    // Cerah siang hari — kondisi outdoor paling ideal
    if (isDay) {
        return "Langit cerah — waktu terbaik untuk olahraga outdoor, hiking, atau sekadar bersantai di luar.";
    }

    // Cerah malam hari
    return "Malam cerah — cocok untuk jalan santai atau sekadar menikmati udara malam yang segar.";
}

// ─── Helper: peringatan keamanan untuk cuaca ekstrem ─────────────────────────

function getWarning(condition: string, temperature: number): string | null {
    const lower = condition.toLowerCase();

    if (isExtremeWeather(condition)) {
        if (lower.includes("thunderstorm") || lower.includes("badai")) {
            return "⚠️ Peringatan: Ada potensi petir dan angin kencang. Hindari pohon besar dan tempat terbuka — tetap di dalam ruangan.";
        }

        if (lower.includes("tornado") || lower.includes("topan") || lower.includes("hurricane")) {
            return "🚨 PERINGATAN DARURAT: Kondisi angin sangat berbahaya. Cari tempat berlindung yang kokoh dan ikuti instruksi otoritas setempat.";
        }

        if (lower.includes("heavy rain") || lower.includes("hujan sangat deras") || lower.includes("violent")) {
            return "⚠️ Peringatan: Hujan sangat deras berpotensi menyebabkan banjir lokal. Hindari area rawan genangan dan jalan yang tergenang.";
        }

        // Kondisi ekstrem lainnya
        return "⚠️ Peringatan: Kondisi cuaca tidak biasa — waspada dan batasi aktivitas di luar ruangan.";
    }

    // Suhu sangat tinggi — heatstroke risk
    if (temperature >= 38) {
        return "⚠️ Suhu sangat tinggi: Risiko heat stroke meningkat. Perbanyak minum air putih dan hindari paparan matahari langsung terlalu lama.";
    }

    // Suhu sangat rendah — hypothermia risk
    if (temperature <= 0) {
        return "⚠️ Suhu di bawah titik beku: Risiko hypothermia. Jaga tubuh tetap kering dan berlapis pakaian hangat.";
    }

    return null;
}

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

/**
 * Menghasilkan saran cuaca personal berdasarkan kondisi saat ini.
 *
 * @param temperature - Suhu dalam Celsius
 * @param condition   - Deskripsi kondisi cuaca (e.g. "light rain", "clear sky")
 * @param isDay       - true jika siang hari, false jika malam
 *
 * @example
 * const advice = getWeatherAdvice(32, "clear sky", true);
 * // → { clothing: "Panas terik...", activity: "Langit cerah...", warning: null }
 */
export function getWeatherAdvice(
    temperature: number,
    condition: string,
    isDay: boolean
): WeatherAdvice {
    return {
        clothing: getClothingAdvice(temperature, isDay),
        activity: getActivityAdvice(condition, isDay),
        warning: getWarning(condition, temperature),
    };
}
