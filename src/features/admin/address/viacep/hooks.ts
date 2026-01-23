import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { readViaCepAddress } from "./read";
import { ViacepResponse } from "./schemas";

// Tipo do retorno
interface ReadViaCepReturn {
  viacepAddress: ViacepResponse;
}

// Opções do hook
interface UseViaCepOptions
  extends Omit<UseQueryOptions<ReadViaCepReturn>, "queryKey" | "queryFn"> {
  zipCode: string;
  enabled?: boolean;
}

export const useReadViaCepAddress = ({
  zipCode,
  enabled = true,
  ...options
}: UseViaCepOptions) => {
  // Remove caracteres não numéricos e valida o CEP
  const cleanZipCode = zipCode?.replace(/\D/g, "") || "";
  const isValidZipCode = cleanZipCode.length === 8;

  return useQuery({
    queryKey: ["viacep", cleanZipCode],
    queryFn: async () => {
      const [data, error] = await readViaCepAddress({ zipCode: cleanZipCode });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: enabled && isValidZipCode,
    staleTime: 60 * 60 * 1000, // 1 hora (dados do CEP não mudam frequentemente)
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    retry: 1,
    ...options,
  });
};

// Hook com debounce para usar em formulários
export const useViaCepDebounced = (zipCode: string, delay = 500) => {
  const [debouncedZipCode, setDebouncedZipCode] = useState(zipCode);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedZipCode(zipCode);
    }, delay);

    return () => clearTimeout(timer);
  }, [zipCode, delay]);

  return useReadViaCepAddress({
    zipCode: debouncedZipCode,
    enabled: debouncedZipCode.replace(/\D/g, "").length === 8,
  });
};
