"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Com SSR, normalmente queremos definir um staleTime padrão
            // acima de 0 para evitar refetch imediato no cliente
            staleTime: 60 * 1000, // 1 minuto
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NuqsAdapter>
          <ThemeProvider
            storageKey="admin-theme"
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </NuqsAdapter>
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
