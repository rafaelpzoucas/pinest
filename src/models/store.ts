import { AddressType } from './user'

export type StoreType = {
  id: string
  name: string
  description: string
  phone: string
  role: string
  user_id: string
  logo_url: string
  addresses: AddressType[]
}
