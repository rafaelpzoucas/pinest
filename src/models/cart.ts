import { ProductType } from './product'

export type CartProductType = ProductType & {
  amount: number
}
