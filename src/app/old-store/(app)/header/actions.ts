import { storeProcedure } from '@/lib/zsa-procedures'
import { ShippingConfigType } from '@/models/shipping'

export const readOwnShipping = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data: shipping, error: shippingError } = await supabase
      .from('shippings')
      .select('*')
      .eq('store_id', store?.id)
      .single()

    if (shippingError) {
      console.error('Erro ao ler os dados de entrega da loja.', shippingError)
    }

    return {
      shipping: shipping as ShippingConfigType,
    }
  })
