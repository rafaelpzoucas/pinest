import { z } from 'zod'

// Schema para razões de cancelamento
export const cancellationReasonsSchema = z.object({
  description: z.string(),
  cancelCodeId: z.string(),
})

export type CancellationReasonsType = z.infer<typeof cancellationReasonsSchema>

// Schema para customizações do iFood
export const ifoodCustomizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  price: z.number(),
  addition: z.number(),
  quantity: z.number(),
  groupName: z.string(),
  unitPrice: z.number(),
  externalCode: z.string(),
})

export type IfoodCustomization = z.infer<typeof ifoodCustomizationSchema>

// Schema para opções do iFood
export const ifoodOptionSchema = z.object({
  id: z.string(),
  ean: z.string(),
  name: z.string(),
  type: z.string(),
  unit: z.string(),
  index: z.number(),
  price: z.number(),
  addition: z.number(),
  quantity: z.number(),
  groupName: z.string(),
  unitPrice: z.number(),
  externalCode: z.string(),
  customizations: z.array(ifoodCustomizationSchema).optional(),
})

export type IfoodOption = z.infer<typeof ifoodOptionSchema>

// Schema para itens do iFood
export const ifoodItemSchema = z.object({
  id: z.string(),
  ean: z.string(),
  name: z.string(),
  type: z.string().optional(),
  unit: z.string(),
  index: z.number(),
  price: z.number(),
  options: z.array(ifoodOptionSchema),
  imageUrl: z.string(),
  quantity: z.number(),
  uniqueId: z.string(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  externalCode: z.string(),
  observations: z.string(),
  optionsPrice: z.number(),
})

export type IfoodItem = z.infer<typeof ifoodItemSchema>

// Schema para métodos de pagamento
export const ifoodPaymentMethodSchema = z.object({
  card: z
    .object({
      brand: z.string(),
    })
    .optional(),
  type: z.string(),
  value: z.number(),
  method: z.string(),
  prepaid: z.boolean(),
  currency: z.string(),
  cash: z
    .object({
      description: z.string(),
      changeFor: z.number().optional(),
    })
    .optional(),
})

export type IfoodPaymentMethod = z.infer<typeof ifoodPaymentMethodSchema>

// Schema para pagamentos
export const ifoodPaymentsSchema = z.object({
  methods: z.array(ifoodPaymentMethodSchema),
  pending: z.number(),
  prepaid: z.number(),
})

export type IfoodPayments = z.infer<typeof ifoodPaymentsSchema>

// Schema para endereço de entrega
export const ifoodDeliveryAddressSchema = z.object({
  streetName: z.string(),
  streetNumber: z.string(),
  formattedAddress: z.string(),
  neighborhood: z.string(),
  complement: z.string(),
  postalCode: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  reference: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
})

export type IfoodDeliveryAddress = z.infer<typeof ifoodDeliveryAddressSchema>

// Schema para entrega
export const ifoodDeliverySchema = z.object({
  mode: z.string(),
  description: z.string(),
  deliveredBy: z.string(),
  deliveryDateTime: z.string(),
  observations: z.string(),
  deliveryAddress: ifoodDeliveryAddressSchema,
  pickupCode: z.string(),
})

export type IfoodDelivery = z.infer<typeof ifoodDeliverySchema>

// Schema para merchant
export const ifoodMerchantSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type IfoodMerchant = z.infer<typeof ifoodMerchantSchema>

// Schema para cliente
export const ifoodCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  documentNumber: z.string(),
  phone: z.object({
    number: z.string(),
    localizer: z.string(),
    localizerExpiration: z.string(),
  }),
  ordersCountOnMerchant: z.number(),
  segmentation: z.string(),
})

export type IfoodCustomer = z.infer<typeof ifoodCustomerSchema>

// Schema para total
export const ifoodTotalSchema = z.object({
  additionalFees: z.number(),
  subTotal: z.number(),
  deliveryFee: z.number(),
  benefits: z.number(),
  orderAmount: z.number(),
})

export type IfoodTotal = z.infer<typeof ifoodTotalSchema>

// Schema para taxas adicionais
export const ifoodAdditionalFeeSchema = z.object({
  type: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  value: z.number(),
  liabilities: z.array(
    z.object({
      name: z.string(),
      percentage: z.number(),
    }),
  ),
})

export type IfoodAdditionalFee = z.infer<typeof ifoodAdditionalFeeSchema>

// Schema para informações adicionais
export const ifoodAdditionalInfoSchema = z.object({
  metadata: z.object({
    developerId: z.string(),
    customerEmail: z.string(),
    developerEmail: z.string(),
  }),
})

export type IfoodAdditionalInfo = z.infer<typeof ifoodAdditionalInfoSchema>

// Schema para patrocínio de benefícios
export const ifoodBenefitSponsorshipSchema = z.object({
  name: z.string(),
  value: z.number(),
  description: z.string(),
})

export type IfoodBenefitSponsorship = z.infer<
  typeof ifoodBenefitSponsorshipSchema
>

// Schema para campanha de benefícios
export const ifoodBenefitCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type IfoodBenefitCampaign = z.infer<typeof ifoodBenefitCampaignSchema>

// Schema para benefícios
export const ifoodBenefitSchema = z.object({
  description: z.string(),
  targetId: z.string(),
  sponsorshipValues: z.array(ifoodBenefitSponsorshipSchema),
  value: z.number(),
  target: z.string(),
  campaign: ifoodBenefitCampaignSchema.optional(),
})

export type IfoodBenefit = z.infer<typeof ifoodBenefitSchema>

// Schema principal para pedidos do iFood
export const ifoodOrderSchema = z.object({
  id: z.string(),
  displayId: z.string(),
  createdAt: z.string(),
  category: z.string(),
  orderTiming: z.string(),
  orderType: z.string(),
  delivery: ifoodDeliverySchema,
  preparationStartDateTime: z.string(),
  benefits: z.array(ifoodBenefitSchema),
  isTest: z.boolean(),
  salesChannel: z.string(),
  merchant: ifoodMerchantSchema,
  customer: ifoodCustomerSchema,
  items: z.array(ifoodItemSchema),
  total: ifoodTotalSchema,
  payments: ifoodPaymentsSchema,
  extraInfo: z.string().optional(),
  additionalFees: z.array(ifoodAdditionalFeeSchema),
  picking: z.object({
    picker: z.string(),
  }),
  additionalInfo: ifoodAdditionalInfoSchema,
  check: z.record(z.unknown()),
})

export type IfoodOrder = z.infer<typeof ifoodOrderSchema>

// Schemas de validação para formulários (exemplos comuns)
export const createOrderSchema = ifoodOrderSchema.omit({
  id: true,
  createdAt: true,
})

export const updateOrderSchema = ifoodOrderSchema.partial().extend({
  id: z.string(),
})

export const orderFiltersSchema = z.object({
  merchantId: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z
    .enum([
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'dispatched',
      'delivered',
      'cancelled',
    ])
    .optional(),
  orderType: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type OrderFilters = z.infer<typeof orderFiltersSchema>

// Schema para resposta paginada
export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Schemas para API responses
export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  })

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
})

export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiError = z.infer<typeof apiErrorSchema>

export type ApiResponse<T> = ApiSuccess<T> | ApiError
