"use client";

import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { readRevenue } from "./read";

type PeriodType = "1" | "3" | "6" | "12" | "custom";

interface UseRevenueParams {
  period: PeriodType;
  customStartDate?: Date;
  customEndDate?: Date;
  enabled?: boolean;
}

export function useRevenue({
  period,
  customStartDate,
  customEndDate,
  enabled = true,
}: UseRevenueParams) {
  return useQuery({
    queryKey: ["revenue", period, customStartDate, customEndDate],
    queryFn: async () => {
      let startDate: Date;
      let endDate: Date;

      if (period === "custom" && customStartDate && customEndDate) {
        startDate = startOfMonth(customStartDate);
        endDate = endOfMonth(customEndDate);
      } else {
        const monthsAgo = parseInt(period);
        endDate = endOfMonth(new Date());
        startDate = startOfMonth(subMonths(new Date(), monthsAgo - 1));
      }

      const [data, error] = await readRevenue({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
  });
}
