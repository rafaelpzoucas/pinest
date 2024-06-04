export type BankAccountType = {
  object: 'bank_account'
  country: string
  currency: string
  account_holder_name: string
  account_number: string
  routing_number?: string
  iban?: string
  account_holder_type?: 'individual' | 'company'
}
