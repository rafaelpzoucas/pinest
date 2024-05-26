interface SupabaseErrorsType {
  [key: string]: string
}

export const supabaseErrors: SupabaseErrorsType = {
  '23505': 'Este nome de loja já existe.',
  '42501': 'Novo registro viola a politica de row-level security.',
}
