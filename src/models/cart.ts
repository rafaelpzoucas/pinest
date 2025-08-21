import { SelectedExtraType } from '@/app/old-store/[product_url]/add-to-cart'
import { ProductType } from './product'

export type CartProductType = {
  id?: string
  session_id?: string
  product_id: string
  quantity: number
  products: ProductType
  product_variations: {
    variation_id: string
  }[]
  product_price: number
  observations?: string[]
  extras?: SelectedExtraType[]
}
