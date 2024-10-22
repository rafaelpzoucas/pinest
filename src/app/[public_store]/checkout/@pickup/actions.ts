import { RequestSimularType, ShippingType } from '@/models/shipping'
import { getCart } from '../../cart/actions'

export type SimulateShippingType = {
  storeURL: string
  storeZipCode: string
  customerZipCode: string
}

export async function simulateShipping(values: SimulateShippingType): Promise<{
  data: ShippingType[] | null
  error: any | null
}> {
  const { cart } = await getCart(values.storeURL)

  if (cart) {
    const { cartPrice, cartWeight } = cart.reduce(
      (acc, item) => {
        const price = item.products.promotional_price || item.products.price
        acc.cartPrice += price * item.quantity
        acc.cartWeight += item.products.pkg_weight * item.quantity
        return acc
      },
      { cartPrice: 0, cartWeight: 0 },
    )

    const products = cart.map((item) => ({
      peso: item.products.pkg_weight,
      altura: item.products.pkg_height,
      largura: item.products.pkg_width,
      comprimento: item.products.pkg_length,
      tipo: '',
      valor: item.products.price,
      quantidade: item.quantity,
    }))

    const simulationData: RequestSimularType = {
      cepOrigem: values.storeZipCode,
      cepDestino: values.customerZipCode,
      vlrMerc: cartPrice,
      pesoMerc: cartWeight,
      volumes: products,
      produtos: products,
      servicos: [],
      ordernar: 'preco',
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/shipping/simulate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storeURL: values.storeURL, simulationData }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        return { data, error: null }
      }
    } catch (error) {
      console.error('Erro ao simular frete:', error)
      return { data: null, error }
    }
  }

  return { data: null, error: null }
}
