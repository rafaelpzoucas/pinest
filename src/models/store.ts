import { MarketNicheType } from './market-niches'
import { AddressType } from './user'

export type StoreType = {
  id: string
  name: string
  description: string
  phone: string
  user_id: string
  logo_url: string
  store_url: string
  market_niche_id: string
  market_niches: MarketNicheType[]
  addresses: AddressType[]
}
