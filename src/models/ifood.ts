export type CancellationReasonsType = {
  description: string
  cancelCodeId: string
}

export type IfoodCustomization = {
  id: string
  name: string
  type: string
  price: number
  addition: number
  quantity: number
  groupName: string
  unitPrice: number
  externalCode: string
}

export type IfoodOption = {
  id: string
  ean: string
  name: string
  type: string
  unit: string
  index: number
  price: number
  addition: number
  quantity: number
  groupName: string
  unitPrice: number
  externalCode: string
  customizations?: IfoodCustomization[]
}

export type IfoodItem = {
  id: string
  ean: string
  name: string
  type?: string
  unit: string
  index: number
  price: number
  options: IfoodOption[]
  imageUrl: string
  quantity: number
  uniqueId: string
  unitPrice: number
  totalPrice: number
  externalCode: string
  observations: string
  optionsPrice: number
}

export type IfoodPaymentMethod = {
  card?: { brand: string }
  type: string
  value: number
  method: string
  prepaid: boolean
  currency: string
  cash?: {
    description: string
    changeFor?: number
  }
}

export type IfoodPayments = {
  methods: IfoodPaymentMethod[]
  pending: number
  prepaid: number
}

export type IfoodDeliveryAddress = {
  streetName: string
  streetNumber: string
  formattedAddress: string
  neighborhood: string
  complement: string
  postalCode: string
  city: string
  state: string
  country: string
  reference: string
  coordinates: { latitude: number; longitude: number }
}

export type IfoodDelivery = {
  mode: string
  description: string
  deliveredBy: string
  deliveryDateTime: string
  observations: string
  deliveryAddress: IfoodDeliveryAddress
  pickupCode: string
}

export type IfoodMerchant = {
  id: string
  name: string
}

export type IfoodCustomer = {
  id: string
  name: string
  documentNumber: string
  phone: {
    number: string
    localizer: string
    localizerExpiration: string
  }
  ordersCountOnMerchant: number
  segmentation: string
}

export type IfoodTotal = {
  additionalFees: number
  subTotal: number
  deliveryFee: number
  benefits: number
  orderAmount: number
}

export type IfoodAdditionalFee = {
  type: string
  description: string
  fullDescription: string
  value: number
  liabilities: { name: string; percentage: number }[]
}

export type IfoodAdditionalInfo = {
  metadata: {
    developerId: string
    customerEmail: string
    developerEmail: string
  }
}

type IfoodBenefitSponsorship = {
  name: string // Nome do patrocinador (e.g. IFOOD, MERCHANT)
  value: number // Valor total do benefício contribuído pelo patrocinador
  description: string // Nome completo do patrocinador
}

type IfoodBenefitCampaign = {
  id: string // Identificador único da campanha (UUID)
  name: string // Nome da campanha
}

type IfoodBenefit = {
  description: string // Descrição do benefício aplicado no pedido
  targetId: string // Id do alvo, se aplicável (e.g. id do item)
  sponsorshipValues: IfoodBenefitSponsorship[] // Lista de valores de patrocínio
  value: number // Valor do desconto do benefício
  target: string // Alvo do benefício (e.g. ITEM, DELIVERY_FEE)
  campaign?: IfoodBenefitCampaign // Detalhes da campanha, se houver
}

export type IfoodOrder = {
  id: string
  displayId: string
  createdAt: string
  category: string
  orderTiming: string
  orderType: string
  delivery: IfoodDelivery
  preparationStartDateTime: string
  benefits: IfoodBenefit[]
  isTest: boolean
  salesChannel: string
  merchant: IfoodMerchant
  customer: IfoodCustomer
  items: IfoodItem[]
  total: IfoodTotal
  payments: IfoodPayments
  extraInfo?: string
  additionalFees: IfoodAdditionalFee[]
  picking: { picker: string }
  additionalInfo: IfoodAdditionalInfo
  check: Record<string, unknown>
}
