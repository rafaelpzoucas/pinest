export type AttributeType = {
  id: string
  name: string
  created_at: string
}

export type AttributeOptionsType = {
  id: string
  value: string
  created_at: string
  attribute_id: string
  attributes: AttributeType
}
