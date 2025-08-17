'use client'

import { useQuery } from '@tanstack/react-query'
import { readStoreAddress } from './read'

interface UseStoreAddressParams {
  subdomain: string
}

export function useReadStoreAddress({ subdomain }: UseStoreAddressParams) {
  return useQuery({
    queryKey: ['store-address', subdomain],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('storeId and productId are required')
      }

      const [data, error] = await readStoreAddress({
        subdomain,
      })

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })
}
