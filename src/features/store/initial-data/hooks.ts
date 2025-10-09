"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { getStoreInitialData, readCategoryWithProducts } from "./read";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  // Nova opção: recheck se o elemento está visível periodicamente
  recheckInterval?: number;
  // Nova opção: quantas vezes revalidar se estiver visível
  recheckAttempts?: number;
}

export function useStoreParams() {
  const [category, setCategory] = useQueryState(
    "categoria",
    parseAsString.withDefault(""),
  );

  return {
    selectedCategory: category,
    setSelectedCategory: setCategory,
  };
}

export function useStoreData(subdomain: string, initialData?: any) {
  return useQuery({
    queryKey: ["store-initial-data", subdomain],
    queryFn: async () => {
      const [data, error] = await getStoreInitialData({
        subdomain,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    initialData, // Usa dados do servidor como estado inicial
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useLazyCategories(categoryId: string, enabled = false) {
  return useQuery({
    queryKey: ["category-with-products", categoryId],
    queryFn: async () => {
      const [data, error] = await readCategoryWithProducts({ categoryId });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    // Configurações de retry
    retry: 3, // Tenta 3 vezes em caso de erro
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Network mode para lidar melhor com problemas de conexão
    networkMode: "online",
    // Refetch automático se a janela ganhar foco e os dados estiverem stale
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "200px",
    freezeOnceVisible = false, // Mudei o default para false
    recheckInterval = 1000, // Recheca a cada 1 segundo
    recheckAttempts = 3, // Tenta 3 vezes
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const recheckCountRef = useRef(0);
  const recheckTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Se já intersectou e está configurado para "freezar", não faz nada
    if (freezeOnceVisible && hasIntersected) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;

        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting) {
          if (!hasIntersected) {
            setHasIntersected(true);
            recheckCountRef.current = 0;
          }

          // Limpa timer anterior se existir
          if (recheckTimerRef.current) {
            clearTimeout(recheckTimerRef.current);
          }

          // Inicia recheck periódico enquanto visível
          const scheduleRecheck = () => {
            if (recheckCountRef.current < recheckAttempts) {
              recheckTimerRef.current = setTimeout(() => {
                // Força re-render para triggerar nova verificação na query
                setHasIntersected((prev) => prev);
                recheckCountRef.current++;

                // Verifica se ainda está visível
                const stillVisible = element.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const elementTop = stillVisible.top;
                const elementBottom = stillVisible.bottom;

                // Se ainda está visível, agenda próximo recheck
                if (elementTop < windowHeight && elementBottom > 0) {
                  scheduleRecheck();
                }
              }, recheckInterval);
            }
          };

          scheduleRecheck();
        } else {
          // Elemento saiu da viewport
          if (recheckTimerRef.current) {
            clearTimeout(recheckTimerRef.current);
          }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (recheckTimerRef.current) {
        clearTimeout(recheckTimerRef.current);
      }
    };
  }, [
    threshold,
    root,
    rootMargin,
    freezeOnceVisible,
    hasIntersected,
    recheckInterval,
    recheckAttempts,
  ]);

  return {
    ref,
    isIntersecting,
    hasIntersected,
  };
}
