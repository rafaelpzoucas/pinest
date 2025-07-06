'use server'

import { storeProcedure } from '@/lib/zsa-procedures'

// export async function getStoreByStoreURL(storeURL: string): Promise<{
//   store: StoreType | null
//   storeError: any | null
// }> {
//   const supabase = createClient()

//   const { data: store, error: storeError } = await supabase
//     .from('stores')
//     .select(
//       `
//         *,
//         store_hours (*),
//         market_niches (*)
//       `,
//     )
//     .eq('store_subdomain', storeURL)
//     .single()

//   return { store, storeError }
// }

export const readStore = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx

    if (!store) {
      return { store: null }
    }

    return { store }
  })
