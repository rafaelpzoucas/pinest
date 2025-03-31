import { HourType } from './hour'
import { MarketNicheType } from './market-niches'
import { AddressType, UserType } from './user'

export type StoreType = {
  id: string
  name: string
  description: string
  phone: string
  user_id: string
  logo_url: string
  store_url: string
  market_niche_id: string
  theme_color: string
  theme_mode: string
  is_open: boolean
  is_open_override: boolean
  market_niches: MarketNicheType[]
  addresses: AddressType[]
  store_hours: HourType[]
  users: UserType
  pix_key: string
}
