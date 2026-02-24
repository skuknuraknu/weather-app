import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

// Geist adalah font modern yang bersih, cocok untuk UI dashboard
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather App",
  description: "Cek cuaca real-time kota mana saja di seluruh dunia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geist.variable} font-sans antialiased`}>
        {/* Semua halaman bisa mengakses React Query context dari sini */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
