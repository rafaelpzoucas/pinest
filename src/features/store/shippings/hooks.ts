'use client'

import { useQuery } from '@tanstack/react-query'
import { readStoreShippings } from './read'

interface UseStoreShippingsParams {
  subdomain: string
}

export function useReadStoreShippings({ subdomain }: UseStoreShippingsParams) {
  return useQuery({
    queryKey: ['store-shippings', subdomain],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('storeId and productId are required')
      }

      const [data, error] = await readStoreShippings({
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
