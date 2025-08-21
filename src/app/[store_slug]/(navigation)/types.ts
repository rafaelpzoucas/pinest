export interface NavigationConfig {
  showBackButton: boolean
  backTo?: string // URL específica para voltar
  title?: string
  actions?: React.ReactNode[]
  variant?: 'default' | 'background' | 'blur'
}
