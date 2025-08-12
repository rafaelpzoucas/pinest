'use server'

import { createClient } from '@/lib/supabase/server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { MarketNicheType } from '@/models/market-niches'
import { StoreType } from '@/models/store'
import { get } from '@vercel/edge-config'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export async function readStoreById(storeId: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(
      `
        *,
        market_niches (*),
        addresses (*),
        users (*)
      `,
    )
    .eq('id', storeId)
    .single()

  return { store, storeError }
}

export const setStoreEdgeConfigVercel = createServerAction()
  .input(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      subdomain: z.string(),
      theme: z
        .object({
          mode: z.string().optional(),
          color: z.string().optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { name, description, logoUrl, subdomain, theme } = input

    // 1. Buscar valor atual
    const existing = await get(`store_${subdomain}`)

    // 2. Merge dos dados
    const updatedValue = {
      ...((existing as any) || {}),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logo_url: logoUrl }),
      ...(theme && {
        theme: {
          // Garante que sempre salva no formato correto (minúsculo)
          mode: theme.mode?.toLowerCase(),
          color: theme.color?.toLowerCase(),
        },
      }),
    }

    // 3. Fazer o PATCH
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: `store_${subdomain}`,
              value: updatedValue,
            },
          ],
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      throw new Error('Não foi possível atualizar o Edge Config')
    }
  })

export const removeStoreLogo = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('stores')
      .update({ logo_url: null })
      .eq('id', store.id)

    if (error) {
      console.error('Erro ao atualizar a coluna logo_url', error)
      return
    }

    await deleteImageFromBucket({ bucket: 'logos', path: store.logo_url })

    revalidatePath('/admin')

    return { data, error }
  })

export async function readMarketNiches(): Promise<{
  marketNiches: MarketNicheType[] | null
  readNichesError: any | null
}> {
  const supabase = createClient()
  const { data: marketNiches, error: readNichesError } = await supabase
    .from('market_niches')
    .select('*')

  return { marketNiches, readNichesError }
}

export const deleteImageFromBucket = adminProcedure
  .createServerAction()
  .input(z.object({ bucket: z.string(), path: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { bucket, path } = input

    const filePath = path.split(`/public/${bucket}/`)[1]

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error('Error deleting image from bucket', error)
    } else {
      revalidatePath('/admin')
    }
  })
