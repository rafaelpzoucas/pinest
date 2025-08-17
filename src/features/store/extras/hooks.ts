'use client'

import { readProductExtras } from '@/features/store/extras/read'
import { useQuery } from '@tanstack/react-query'

interface UseProductExtrasParams {
  storeId?: string
  productId?: string
  enabled?: boolean
}

export function useProductExtras({
  storeId,
  productId,
  enabled = true,
}: UseProductExtrasParams) {
  return useQuery({
    queryKey: ['product-extras', storeId, productId],
    queryFn: async () => {
      if (!storeId || !productId) {
        throw new Error('storeId and productId are required')
      }

      const [data, error] = await readProductExtras({
        storeId,
        productId,
      })

      if (error) {
        throw error
      }

      return data
    },
    enabled: enabled && !!storeId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })
}
