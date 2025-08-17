import { useQuery } from '@tanstack/react-query'
import { readStoreBySlug } from './read'

interface UseReadStoreParams {
  storeSlug: string
}

export function useReadStore({ storeSlug }: UseReadStoreParams) {
  return useQuery({
    queryKey: ['store', storeSlug],
    queryFn: async () => {
      if (!storeSlug) {
        throw new Error('storeSlug are required')
      }

      const [data, error] = await readStoreBySlug({
        storeSlug,
      })

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })
}
