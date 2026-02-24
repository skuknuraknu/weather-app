"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // Buat QueryClient sekali per sesi — useState memastikan
    // instance tidak dibuat ulang setiap kali komponen ini re-render
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data dianggap fresh selama 1 menit sebelum di-refetch
                        staleTime: 60 * 1000,
                        // Coba ulang maksimal 1x jika request gagal
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools hanya aktif di environment development */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
