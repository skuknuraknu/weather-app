"use client";

import { useState, useEffect, useRef } from "react";
import { CloudSun, Shirt, TriangleAlert, Wind } from "lucide-react";
import { gsap } from "gsap";
import { useDebounce } from "@/hooks/use-debounce";
import { useWeather } from "@/hooks/use-weather";
import { getWeatherAdvice } from "@/lib/get-weather-advice";
import { getLocalIsDaytime } from "@/lib/get-local-is-daytime";
import { WeatherSkeleton } from "@/components/ui/WeatherSkeleton";
import { ErrorToast } from "@/components/ui/ErrorToast";
import {
  RainBackground,
  SunnyBackground,
  CloudyBackground,
  NightBackground,
} from "@/components/backgrounds";
import { Search } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Deteksi tipe cuaca dari description.
// API dipanggil dengan lang=id, jadi description bisa berupa bahasa Indonesia
// ("hujan ringan", "gerimis", "berawan") ATAU bahasa Inggris ("light rain", "drizzle", "clouds").
// Kita cek keduanya agar tidak bergantung pada bahasa yang diset di API.
type WeatherType = "rain" | "cloud" | "sunny";

function getWeatherType(description?: string): WeatherType {
  if (!description) return "sunny";
  const lower = description.toLowerCase();

  // Kata kunci hujan — bahasa Indonesia & Inggris
  const rainKeywords = ["hujan", "gerimis", "rain", "drizzle", "shower"];
  if (rainKeywords.some((kw) => lower.includes(kw))) return "rain";

  // Kata kunci mendung/berawan — bahasa Indonesia & Inggris
  const cloudKeywords = ["berawan", "mendung", "awan", "cloud", "overcast"];
  if (cloudKeywords.some((kw) => lower.includes(kw))) return "cloud";

  return "sunny";
}

function WeatherBackground({ description, isDay }: { description?: string; isDay: boolean }) {
  if (!description) return null;
  const type = getWeatherType(description);
  return (
    <>
      {/* Overlay bintang — tampil hanya di malam hari di semua kondisi cuaca */}
      {!isDay && <NightBackground />}
      {type === "rain" && <RainBackground isDay={isDay} />}
      {type === "cloud" && <CloudyBackground isDay={isDay} />}
      {type === "sunny" && <SunnyBackground isDay={isDay} />}
    </>
  );
}

// 6 kombinasi gradasi: 3 jenis cuaca × 2 waktu (siang/malam)
function getGradient(description?: string, isDay?: boolean): string {
  const type = getWeatherType(description);
  if (!description) return "from-slate-900 via-indigo-950 to-slate-900";

  if (type === "rain") {
    return isDay
      ? "from-slate-600 via-blue-800 to-slate-700"
      : "from-slate-900 via-blue-950 to-slate-900";
  }
  if (type === "cloud") {
    return isDay
      ? "from-slate-400 via-slate-500 to-slate-600"
      : "from-slate-800 via-slate-900 to-slate-950";
  }
  // sunny
  return isDay
    ? "from-sky-800 via-blue-900 to-indigo-950"
    : "from-slate-900 via-indigo-950 to-blue-950";
}

// Warna aksen advice card — 6 kombinasi dengan kontras yang benar di siang/malam
function getAccentColor(description?: string, isDay?: boolean): string {
  const type = getWeatherType(description);
  if (!description) return "border-indigo-400/30 bg-indigo-500/10";

  if (type === "rain") {
    return isDay
      ? "border-blue-300/40 bg-blue-400/15"
      : "border-blue-400/30 bg-blue-500/10";
  }
  if (type === "cloud") {
    return isDay
      ? "border-slate-300/50 bg-slate-400/20"
      : "border-slate-400/30 bg-slate-500/10";
  }
  // sunny
  return isDay
    ? "border-amber-300/50 bg-amber-400/20"
    : "border-indigo-400/30 bg-indigo-500/10";
}

// ─── Komponen AdviceCard ──────────────────────────────────────────────────────

interface AdviceCardProps {
  clothing: string;
  activity: string;
  warning: string | null;
  description?: string;
  isDay: boolean;
}

function AdviceCard({ clothing, activity, warning, description, isDay }: AdviceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const weatherType = getWeatherType(description);

    // ── Animasi masuk card: berbeda per cuaca ──────────────────────────────

    if (weatherType === "rain") {
      // Hujan: card "jatuh" dari atas seperti tetesan air
      gsap.fromTo(card,
        { y: -40, opacity: 0, scaleY: 0.9 },
        { y: 0, opacity: 1, scaleY: 1, duration: 0.6, ease: "bounce.out" }
      );
    } else if (weatherType === "cloud") {
      // Mendung: card terbawa angin dari kiri — lambat dan lembut
      gsap.fromTo(card,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: "power2.out" }
      );
    } else {
      // Cerah: card muncul dengan "pop" — energik seperti matahari
      gsap.fromTo(card,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }
      );
    }

    // ── Animasi stagger pada tiap baris advice ─────────────────────────────
    // Setiap baris muncul berurutan 80ms setelah card masuk
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { x: 12, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power1.out",
          delay: 0.25,
        }
      );
    }
  }, [description, clothing, activity, warning]);

  return (
    <div
      ref={cardRef}
      className={`w-full rounded-2xl border p-5 backdrop-blur-md ${getAccentColor(description, isDay)}`}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
        Saran Cuaca
      </p>

      {/* Baris pakaian */}
      <div
        ref={(el) => { if (el) rowsRef.current[0] = el; }}
        className="mb-3 flex items-start gap-3"
      >
        <Shirt size={16} className="mt-0.5 shrink-0 text-white/60" />
        <p className="text-sm leading-relaxed text-white/80">{clothing}</p>
      </div>

      {/* Baris aktivitas */}
      <div
        ref={(el) => { if (el) rowsRef.current[1] = el; }}
        className="mb-3 flex items-start gap-3"
      >
        <Wind size={16} className="mt-0.5 shrink-0 text-white/60" />
        <p className="text-sm leading-relaxed text-white/80">{activity}</p>
      </div>

      {/* Peringatan — hanya tampil jika ada */}
      {warning && (
        <div
          ref={(el) => { if (el) rowsRef.current[2] = el; }}
          className="mt-3 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm leading-relaxed text-red-300">{warning}</p>
        </div>
      )}
    </div>
  );
}

// ─── Komponen WeatherCard dengan animasi suhu ─────────────────────────────────

interface WeatherCardProps {
  data: {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
    windSpeed: number;
  };
}

function WeatherCard({ data }: WeatherCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const temp = tempRef.current;
    if (!card || !temp) return;

    // Card slide-up + fade in setiap kali data baru masuk
    const cardAnim = gsap.fromTo(card,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );

    // Angka suhu "bouncing in" — menarik perhatian ke info paling penting
    const tempAnim = gsap.fromTo(temp,
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, delay: 0.15, ease: "back.out(1.8)" }
    );

    return () => {
      cardAnim.kill();
      tempAnim.kill();
    };
  }, [data.city, data.temperature]);

  return (
    <div
      ref={cardRef}
      className="w-full rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
    >
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-lg font-semibold text-white">{data.city}</p>
        <span className="text-xs text-white/50">{data.country}</span>
      </div>

      <p ref={tempRef} className="text-6xl font-bold tabular-nums text-white">
        {Math.round(data.temperature)}°
        <span className="ml-1 text-2xl font-normal text-white/60">C</span>
      </p>

      <p className="mt-2 capitalize text-sm text-white/60">{data.description}</p>

      <div className="my-4 border-t border-white/10" />

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl bg-white/10 px-2 py-3">
          <p className="mb-1 text-xs text-white/50">Terasa</p>
          <p className="font-semibold text-white">{Math.round(data.feelsLike)}°C</p>
        </div>
        <div className="rounded-xl bg-white/10 px-2 py-3">
          <p className="mb-1 text-xs text-white/50">Kelembapan</p>
          <p className="font-semibold text-white">{data.humidity}%</p>
        </div>
        <div className="rounded-xl bg-white/10 px-2 py-3">
          <p className="mb-1 text-xs text-white/50">Angin</p>
          <p className="font-semibold text-white">
            {data.windSpeed} <span className="text-xs font-normal">m/s</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);

  // Debounce 500ms agar API tidak dipanggil setiap keystroke
  const debouncedCity = useDebounce(inputValue, 500);
  const { data, isLoading, isError, error } = useWeather(debouncedCity);

  // Animasi header saat pertama kali halaman dimuat
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  // Hitung isDaytime berdasarkan waktu LOKAL KOTA TUJUAN menggunakan
  // data dt (unix timestamp) + timezone (UTC offset detik) dari OWM.
  // Fallback ke jam perangkat jika data belum tersedia.
  const isDay = data
    ? getLocalIsDaytime(data.dt, data.timezone)
    : new Date().getHours() >= 6 && new Date().getHours() < 18;

  // Hitung advice hanya jika data cuaca sudah tersedia
  const advice = data
    ? getWeatherAdvice(data.temperature, data.description, isDay)
    : null;

  const gradient = getGradient(data?.description, isDay);

  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br ${gradient} px-4 py-16 transition-all duration-1000`}
    >
      {/* Layer animasi cuaca — di belakang semua konten */}
      <WeatherBackground description={data?.description} isDay={isDay} />

      {/* Wrapper konten — z-10 supaya di atas layer background */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">

        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center gap-2 text-center">
          <CloudSun size={40} className="text-white/80" />
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Weather Now
          </h1>
          <p className="text-sm text-white/50">
            Ketik nama kota untuk melihat cuaca terkini
          </p>
        </div>

        {/* Input pencarian */}
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            aria-hidden="true"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Cari kota... (e.g. Jakarta)"
            className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-md outline-none transition focus:border-white/40 focus:bg-white/15"
            aria-label="Cari nama kota"
          />
        </div>

        {/* Skeleton — tampil saat loading & ada input */}
        {isLoading && debouncedCity && <WeatherSkeleton />}

        {/* Card cuaca + Advice card */}
        {data && !isLoading && (
          <>
            <WeatherCard data={data} />

            {advice && (
              <AdviceCard
                clothing={advice.clothing}
                activity={advice.activity}
                warning={advice.warning}
                description={data.description}
                isDay={isDay}
              />
            )}
          </>
        )}

        {/* Placeholder saat belum ada input */}
        {!debouncedCity && !isLoading && (
          <p className="text-center text-sm text-white/30">
            Mulai ketik untuk mencari cuaca kota
          </p>
        )}
      </div>

      {/* Toast error */}
      {isError && error && <ErrorToast message={error} key={error} />}
    </main>
  );
}
