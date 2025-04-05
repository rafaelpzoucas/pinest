import { AddressType } from './address'

export type CustomerType = {
  id: string
  name: string
  phone: string
  address: AddressType
  created_at: string
}
