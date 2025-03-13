import { ProductType } from '@/models/product'
import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createPurchaseFormSchema } from '../form'
import { readProducts } from './actions'

export function ProductsList({
  form,
}: {
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
}) {
  const [products, setProducts] = useState<ProductType[]>([])
  const { execute, data } = useServerAction(readProducts, {
    onSuccess: () => {
      if (data) {
        setProducts(data.products)
      }
    },
  })

  useEffect(() => {
    execute()
  }, [])
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
