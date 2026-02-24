"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { XCircle, X } from "lucide-react";

interface ErrorToastProps {
    message: string;
    /** Durasi toast tampil sebelum otomatis hilang, dalam milidetik (default 4000) */
    duration?: number;
    /** Callback yang dipanggil setelah toast benar-benar hilang */
    onDismiss?: () => void;
}

/**
 * Toast notifikasi untuk menampilkan pesan error pencarian.
 *
 * Muncul dengan animasi slide-in dari bawah (GSAP), dan otomatis
 * menghilang setelah `duration` ms. User juga bisa menutupnya manual.
 */
export function ErrorToast({
    message,
    duration = 4000,
    onDismiss,
}: ErrorToastProps) {
    const toastRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(true);

    // Fungsi dismiss yang memastikan animasi keluar selesai dulu
    // sebelum komponen benar-benar di-unmount
    const dismiss = () => {
        const toast = toastRef.current;
        if (!toast) return;

        gsap.to(toast, {
            y: 20,
            opacity: 0,
            duration: 0.25,
            ease: "power1.in",
            onComplete: () => {
                setVisible(false);
                onDismiss?.();
            },
        });
    };

    useEffect(() => {
        const toast = toastRef.current;
        if (!toast) return;

        // Animasi masuk: slide dari bawah + fade in
        gsap.fromTo(
            toast,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );

        // Timer otomatis dismiss
        const timer = setTimeout(dismiss, duration);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    // Setelah animasi keluar, jangan render apapun
    if (!visible) return null;

    return (
        <div
            ref={toastRef}
            role="alert"
            aria-live="assertive"
            className="fixed bottom-6 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 items-start gap-3 rounded-xl border border-red-400/30 bg-red-950/80 px-4 py-3 shadow-xl backdrop-blur-md"
        >
            {/* Ikon error */}
            <XCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-400"
                aria-hidden="true"
            />

            {/* Pesan error */}
            <p className="flex-1 text-sm leading-snug text-red-200">{message}</p>

            {/* Tombol tutup manual */}
            <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-lg p-0.5 text-red-400 transition-colors hover:bg-red-400/20 hover:text-red-300"
                aria-label="Tutup notifikasi"
            >
                <X size={16} />
            </button>
        </div>
    );
}
