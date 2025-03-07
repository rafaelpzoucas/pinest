import { StoreType } from './store'

export type AddressType = {
  id: string
  city: string
  state: string
  number: string
  street: string
  user_id: string
  zip_code: string
  complement: string
  created_at: string
  neighborhood: string
}

export type UserType = {
  id: string
  name: string
  email: string
  cpf_cnpj: string
  created_at: string
  updated_at: string
  role: string
  phone: string
  stripe_account_id: string
  subscription_status: string
  stores: StoreType[]
  addresses?: AddressType[]
}

export type GuestType = {
  name: string
  phone: string
  address: AddressType
}
