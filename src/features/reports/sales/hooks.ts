import { useQuery } from "@tanstack/react-query";
import { getSalesReportByCashSessionId } from "./read-by-cash-session-id";

/**
 * Hook para buscar o relatório de vendas baseado no ID da sessão de caixa
 * @param cashSessionId - ID da sessão de caixa atual
 * @returns Query com dados do relatório de vendas
 */
export function useReadSalesReport(cashSessionId?: string) {
  return useQuery({
    queryKey: ["sales-report", cashSessionId],
    queryFn: async () => {
      const [data, error] = await getSalesReportByCashSessionId();
      if (error) throw error;
      return data;
    },
    enabled: !!cashSessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
