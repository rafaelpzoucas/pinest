'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const readPurchaseById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { data: purchase, error: readPurchaseError } = await supabase
      .from('purchases')
      .select(
        `
      *,
      purchase_items (
        *,
        products (*)
      ),
      purchase_item_variations (
        *,
        product_variations (*)
      ),
      customers (
        *,
        users (*)
      ),
      addresses (*)
      `,
      )
      .eq('id', input.id)
      .single()

    if (readPurchaseError || !purchase) {
      console.error('Error reading purchase.', readPurchaseError)
      return
    }

    return { purchase }
  })

export async function acceptPurchase(purchaseId: string) {
  const supabase = createClient()

  const { error: updateStatusError } = await supabase
    .from('purchases')
    .update({ accepted: true, status: 'preparing' })
    .eq('id', purchaseId)

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/purchases')
}

export async function cancelPurchase(purchaseId: string) {
  const supabase = createClient()

  const { error: updateStatusError } = await supabase
    .from('purchases')
    .update({ accepted: true, status: 'cancelled' })
    .eq('id', purchaseId)

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/purchases')
}

export async function updateDiscount(purchaseId: string, discount: number) {
  const supabase = createClient()

  const { error } = await supabase
    .from('purchases')
    .update({ discount })
    .eq('id', purchaseId)

  if (error) {
    console.error('Erro ao atualizar o desconto: ', error)
  }

  revalidatePath('/admin/purchases')
}

export async function updatePurchaseStatus(
  newStatus: string,
  purchaseId: string,
) {
  const supabase = createClient()

  const { error: updateStatusError } = await supabase
    .from('purchases')
    .update({ status: newStatus })
    .eq('id', purchaseId)

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/purchases')
}
